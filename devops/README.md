# EvoGym — Infrastructure & CI/CD

Terraform-provisioned AWS infrastructure (EKS on Fargate, RDS, ECR, ALB) with
GitHub Actions for CI and Argo CD for GitOps delivery, across **dev**,
**staging** and **prod** in `ap-south-1`.

```
Developer pushes code
        │
        ▼
GitHub Actions ──► builds image ──► pushes to ECR ──► commits new tag
   (OIDC, no                                          into the overlay
    AWS keys)                                                │
                                                             ▼
                                                   Argo CD sees the commit
                                                             │
                                                             ▼
                                          EKS Fargate (backend + frontend)
                                                     │            │
                                                  RDS Postgres   ALB
```

## Repository layout

```
.github/workflows/          backend-ci · frontend-ci · terraform
devops/
  terraform/
    global/shared/          ECR repos, GitHub OIDC provider, per-env IAM roles
    modules/                vpc · eks-fargate · rds · alb-controller · argocd
    environments/           dev · staging · prod  (one state file each)
  kubernetes/
    backend/base|overlays/  Deployment, Service, Ingress, migration Job
    frontend/base|overlays/ Deployment, Service, Ingress
  argocd/
    bootstrap/              root "app of apps" — applied once per cluster
    apps/<env>/             the Applications Argo CD manages
  docker/                   backend + frontend Dockerfiles
  scripts/                  state-backend bootstrap
```

Branch → environment mapping is used consistently by every workflow:

| Branch | Environment | Argo CD sync |
|---|---|---|
| `develop` | dev | automatic |
| `staging` | staging | automatic |
| `main` | prod | **manual promote** |

## One-time setup

### 1. Terraform state backend

```bash
cd devops/scripts
./bootstrap-state-backend.sh
```

Creates the versioned, encrypted S3 bucket and the DynamoDB lock table that
every stack's `backend.tf` refers to. Terraform can't create its own state
backend, so this runs first.

### 2. Shared account resources

```bash
cd devops/terraform/global/shared
terraform init
terraform apply
```

This creates the two ECR repositories, the GitHub OIDC provider, and the six
IAM roles (`app-deployer` and `terraform-deployer` per environment). Each role
trusts **only** the branch that deploys to it — the prod role can only be
assumed by a workflow running on `main`.

Edit `terraform.tfvars` first if your GitHub org/repo differs from
`wasim0028/gym-typescript`.

### 3. GitHub configuration

Create three [Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
named `dev`, `staging` and `prod`. Add **required reviewers** to `prod` so
infrastructure applies and production deploys pause for approval.

Repository secret:

| Secret | Value |
|---|---|
| `AWS_ACCOUNT_ID` | your 12-digit AWS account ID |

Per-environment secrets (set inside each GitHub Environment):

| Secret | Notes |
|---|---|
| `RAZORPAY_KEY_ID` | test keys for dev/staging, live keys for prod |
| `RAZORPAY_KEY_SECRET` | as above |

There are deliberately **no AWS access keys** — GitHub Actions authenticates by
exchanging a short-lived OIDC token for temporary credentials.

### 4. Provision an environment

Either push to the matching branch and let the `Terraform Infrastructure`
workflow run, or apply locally:

```bash
cd devops/terraform/environments/dev
terraform init
terraform apply \
  -var="razorpay_key_id=rzp_test_xxx" \
  -var="razorpay_key_secret=xxx"
```

This builds the VPC, the EKS cluster with two Fargate profiles, the AWS Load
Balancer Controller, Argo CD, and RDS Postgres — then creates the `evogym`
namespace and the `evogym-backend-secrets` Secret containing the database URL,
freshly generated JWT secrets, and the Razorpay keys. The application manifests
consume that Secret directly, so there's no manual copy-paste step.

Expect roughly 15–20 minutes for a first apply.

### 5. Point kubectl at the cluster and bootstrap Argo CD

```bash
aws eks update-kubeconfig --region ap-south-1 --name evogym-dev

# metrics-server, required by the HPAs in staging/prod
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

kubectl apply -f devops/argocd/bootstrap/root-app-dev.yaml
```

The root Application manages everything under `devops/argocd/apps/dev/`, so
adding a new service later is just committing another file there.

Initial Argo CD admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
kubectl -n argocd port-forward svc/argocd-server 8080:443
```

Set `argocd_hostname` in the environment's `terraform.tfvars` to expose the UI
through the ALB instead of port-forwarding.

## The day-to-day flow

1. Merge a PR into `develop`.
2. `Backend CI/CD` / `Frontend CI/CD` type-check, lint and build, then build a
   Docker image tagged `dev-<short-sha>` and push it to ECR.
3. The workflow runs `kustomize edit set image` on the dev overlay and commits
   the result with `[skip ci]`.
4. Argo CD notices the commit and syncs. Before the Deployment rolls, its
   `PreSync` hook runs `prisma migrate deploy` so the schema is always ahead of
   the code that needs it.
5. Promote by merging `develop → staging → main`. On `main`, CI still builds
   and commits the tag, but Argo CD waits for a human to press **Sync**.

## Notes and gotchas

- **Fargate needs `target-type: ip`.** There are no EC2 nodes to register as
  ALB targets, so both Ingresses set it. They also share
  `group.name: evogym`, which puts the frontend and backend behind a *single*
  ALB — `/api` routes to the backend (`group.order: 10`), everything else falls
  through to the frontend SPA (`group.order: 20`).
- **The frontend API URL is baked in at build time.** Vite inlines env vars, so
  `VITE_API_URL` is a Docker build arg. It defaults to the relative `/api`,
  which works because both apps share one ALB. Only override it (via a GitHub
  Actions variable) if you split them onto separate domains.
- **Before the first CI run**, the overlays point at a `<env>-latest` tag that
  doesn't exist yet, so pods will sit in `ImagePullBackOff`. The first
  successful pipeline run fixes this by committing a real tag.
- **ECR tags are immutable**, which is why every image is tagged with its commit
  SHA rather than being overwritten. Lifecycle policies expire untagged images
  after 7 days and keep the last 30 tagged ones.
- **HTTPS is not configured.** Both Ingresses listen on port 80 only. Once you
  have a domain and an ACM certificate, add
  `alb.ingress.kubernetes.io/certificate-arn` and a `443` listener to the
  Ingress annotations, and set `argocd_hostname`.
- **The `terraform-deployer` IAM policy is broad** (`ec2:*`, `eks:*`, `rds:*`).
  That's typical for an infra-provisioning role, but tighten it to your
  organisation's requirements before relying on it in production.
- **Cost.** Each environment runs its own VPC, NAT gateway(s), EKS control
  plane (~$0.10/hr) and RDS instance. Prod additionally uses one NAT gateway
  per AZ and Multi-AZ RDS. Destroy environments you aren't using:
  `terraform destroy` (prod has `deletion_protection = true` on RDS, so disable
  that first).
