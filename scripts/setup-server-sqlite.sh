#!/bin/bash

# AWS Lightsail Server Setup Script (SQLite Version)
# This script sets up a fresh Ubuntu server for Next.js deployment with SQLite

set -e

echo "🚀 Starting AWS Lightsail server setup (SQLite)..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x (LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js installed: $node_version"
echo "✅ npm installed: $npm_version"

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Install Git
echo "📦 Installing Git..."
sudo apt-get install -y git

# Install build essentials (for native modules)
echo "📦 Installing build essentials..."
sudo apt-get install -y build-essential

# Install SQLite (usually pre-installed, but ensure it's there)
echo "📦 Installing SQLite..."
sudo apt-get install -y sqlite3

# Verify SQLite installation
sqlite_version=$(sqlite3 --version | cut -d' ' -f1)
echo "✅ SQLite installed: $sqlite_version"

# Create application directory
echo "📁 Creating application directory..."
APP_DIR="/var/www/ai-tech-news"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Create backups directory
echo "📁 Creating backups directory..."
mkdir -p $APP_DIR/backups
mkdir -p $APP_DIR/logs

# Create scripts directory
mkdir -p $APP_DIR/scripts

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Upload your application files to: $APP_DIR"
echo "   2. Update prisma/schema.prisma to use SQLite:"
echo "      datasource db { provider = \"sqlite\" url = env(\"DATABASE_URL\") }"
echo "   3. Create .env file with:"
echo "      DATABASE_URL=\"file:./prisma/prod.db\""
echo "      ADMIN_PASSWORD=your_secure_password"
echo "      NEXT_PUBLIC_SITE_URL=http://YOUR_SERVER_IP"
echo "      NEXT_PUBLIC_SITE_NAME=\"AI Tech News\""
echo "      NODE_ENV=production"
echo "   4. Run deployment:"
echo "      cd $APP_DIR"
echo "      npm install --production"
echo "      npx prisma generate"
echo "      npx prisma db push"
echo "      npm run build"
echo "      pm2 start npm --name \"ai-tech-news\" -- start"
echo "   5. Configure Nginx (see PRODUCTION_DEPLOYMENT.md)"

