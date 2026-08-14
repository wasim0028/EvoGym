output "endpoint" {
  value = aws_db_instance.this.address
}

output "port" {
  value = 5432
}

output "database_name" {
  value = var.db_name
}

output "master_username" {
  value = var.master_username
}

output "master_password" {
  value     = random_password.master.result
  sensitive = true
}

output "connection_string" {
  value     = "postgresql://${var.master_username}:${random_password.master.result}@${aws_db_instance.this.address}:5432/${var.db_name}?schema=public"
  sensitive = true
}

output "security_group_id" {
  value = aws_security_group.rds.id
}

output "secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}
