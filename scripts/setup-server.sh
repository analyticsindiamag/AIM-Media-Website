#!/bin/bash

# AWS Lightsail Server Setup Script
# This script sets up a fresh Ubuntu server for Next.js deployment

set -e

echo "🚀 Starting AWS Lightsail server setup..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x (LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Install Git (if not already installed)
echo "📦 Installing Git..."
sudo apt-get install -y git

# Install build essentials (for native modules)
echo "📦 Installing build essentials..."
sudo apt-get install -y build-essential

# Create application directory
echo "📁 Creating application directory..."
APP_DIR="/var/www/ai-tech-news"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Configure PostgreSQL
echo "🗄️  Configuring PostgreSQL..."
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE aitechnews;

-- Create user (you'll be prompted for password)
CREATE USER aitechnews_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aitechnews TO aitechnews_user;

-- Exit psql
\q
EOF

echo "✅ Server setup complete!"
echo ""
echo "⚠️  IMPORTANT: Change the PostgreSQL password!"
echo "   Run: sudo -u postgres psql"
echo "   Then: ALTER USER aitechnews_user WITH PASSWORD 'your_secure_password';"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy your application using: ./scripts/deploy.sh"
echo "   2. Configure Nginx using: ./scripts/configure-nginx.sh"
echo "   3. Set up environment variables in: /var/www/ai-tech-news/.env"

