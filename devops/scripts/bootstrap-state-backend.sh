#!/usr/bin/env bash
# Creates the S3 bucket + DynamoDB table that hold Terraform remote state.
# Chicken-and-egg: this can't be managed by the Terraform that depends on it,
# so run it ONCE per AWS account before the first `terraform init`.
#
#   ./bootstrap-state-backend.sh
set -euo pipefail

REGION="${AWS_REGION:-ap-south-1}"
BUCKET="${TF_STATE_BUCKET:-evogym-terraform-state}"
TABLE="${TF_LOCK_TABLE:-evogym-terraform-locks}"

echo "Region: $REGION | Bucket: $BUCKET | Lock table: $TABLE"

if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "Bucket $BUCKET already exists, skipping."
else
  aws s3api create-bucket \
    --bucket "$BUCKET" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"

  aws s3api put-bucket-versioning \
    --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled

  aws s3api put-bucket-encryption \
    --bucket "$BUCKET" \
    --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

  aws s3api put-public-access-block \
    --bucket "$BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

  echo "Created bucket $BUCKET (versioned, encrypted, private)."
fi

if aws dynamodb describe-table --table-name "$TABLE" --region "$REGION" >/dev/null 2>&1; then
  echo "Table $TABLE already exists, skipping."
else
  aws dynamodb create-table \
    --table-name "$TABLE" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION"
  echo "Created lock table $TABLE."
fi

echo "Done. You can now run 'terraform init' in devops/terraform/global/shared."
