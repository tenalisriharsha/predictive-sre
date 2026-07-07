# Find the latest Amazon Linux 2023 AMI (x86_64)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Generate SSH key pair automatically
resource "tls_private_key" "deployer" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Save private key to local file
resource "local_file" "private_key" {
  content         = tls_private_key.deployer.private_key_pem
  filename        = "${path.module}/${var.cluster_name}-key.pem"
  file_permission = "0400"
}

# Upload public key to AWS
resource "aws_key_pair" "deployer" {
  key_name   = "${var.cluster_name}-key"
  public_key = tls_private_key.deployer.public_key_openssh
}

# Security Group (firewall rules)
resource "aws_security_group" "k3s" {
  name_prefix = "${var.cluster_name}-sg"
  vpc_id      = aws_vpc.main.id

  # SSH access (port 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # HTTP access (port 80)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # k3s API (port 6443) — for kubectl from your laptop
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-sg"
  }
}

# The EC2 instance (t3.micro = free tier)
resource "aws_instance" "k3s" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.k3s.id]
  key_name               = aws_key_pair.deployer.key_name

  root_block_device {
    volume_size = 30  # GB (within 30 GB free tier limit)
    volume_type = "gp3"
  }

  # This script runs automatically when the server boots
  user_data = <<-EOF
    #!/bin/bash
    set -e
    
    # Update system
    dnf update -y
    
    # Install k3s (lightweight Kubernetes) with minimal features to save RAM
    curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --disable traefik --disable metrics-server --disable local-storage" sh -
    
    # Wait for k3s to be ready
    sleep 60
    
    # Make kubeconfig readable
    chmod 644 /etc/rancher/k3s/k3s.yaml
    
    # Create symlink for kubectl
    ln -sf /usr/local/bin/k3s /usr/local/bin/kubectl
    
    # Verify cluster is up
    kubectl get nodes > /var/log/k3s-setup.log 2>&1 || true
  EOF

  tags = {
    Name = "${var.cluster_name}-k3s-node"
  }
}

# Elastic IP (static IP — free while attached to running instance)
resource "aws_eip" "k3s" {
  instance = aws_instance.k3s.id
  domain   = "vpc"

  tags = {
    Name = "${var.cluster_name}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}
