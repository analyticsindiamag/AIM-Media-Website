#!/bin/bash

# Deployment Script for AWS Lightsail
# Run this script on your Lightsail instance to deploy the application

set -e

APP_DIR="/var/www/ai-tech-news"
APP_USER=${USER}
SERVICE_NAME="ai-tech-news"

echo "🚀 Starting deployment..."

# Check if .env file exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "❌ Error: .env file not found at $APP_DIR/.env"
    echo "   Please create it with your environment variables first."
    exit 1
fi

cd $APP_DIR

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || git pull origin master
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma db push --accept-data-loss || npx prisma migrate deploy

# Seed database (only if tables are empty)
echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seed failed or already populated, continuing..."

# Build the application
echo "🏗️  Building application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart $SERVICE_NAME || pm2 start npm --name $SERVICE_NAME -- start

# Save PM2 process list
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be running at: http://$(curl -s ifconfig.me)"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs $SERVICE_NAME"

