data "aws_acm_certificate" "wildcard" {
  domain = "*.${data.terraform_remote_state.domain.outputs.domain_name}"
  statuses = ["ISSUED"]
  most_recent = true
}
