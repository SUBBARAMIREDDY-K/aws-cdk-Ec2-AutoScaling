#!/bin/bash

sudo su
# Update package lists
yum update -y

# Install Apache
yum install httpd -y


sudo systemctl enable httpd
# Start and enable Apache
sudo systemctl start httpd


# Restart Apache
sudo systemctl restart httpd

echo "<h1>Hello AutoScaling Group using AWS CDK</h1>" > /var/www/html/index.html


