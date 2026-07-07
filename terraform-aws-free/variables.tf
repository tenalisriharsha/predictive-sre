variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "Name for this deployment"
  type        = string
  default     = "predictive-sre-free"
}

variable "instance_type" {
  description = "EC2 instance type (must be free tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "my_ip" {
  description = "Your IP address for SSH access (CIDR format)"
  type        = string
  default     = "0.0.0.0/0"  # CHANGE THIS TO YOUR IP/32 FOR SECURITY
}
