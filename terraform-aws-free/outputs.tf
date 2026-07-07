output "public_ip" {
  description = "Elastic IP address of the server"
  value       = aws_eip.k3s.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh -i ${local_file.private_key.filename} ec2-user@${aws_eip.k3s.public_ip}"
}

output "kubeconfig_command" {
  description = "Command to set up kubectl from your laptop"
  value       = "ssh -i ${local_file.private_key.filename} ec2-user@${aws_eip.k3s.public_ip} sudo cat /etc/rancher/k3s/k3s.yaml > ~/.kube/config-aws && sed -i '' 's/127.0.0.1/${aws_eip.k3s.public_ip}/g' ~/.kube/config-aws && export KUBECONFIG=~/.kube/config-aws"
}

output "website_url" {
  description = "URL to access your application (after deployment)"
  value       = "http://${aws_eip.k3s.public_ip}"
}
