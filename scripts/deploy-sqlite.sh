#!/bin/bash

# Quick Deployment Script for SQLite Production
# Run this after initial setup to deploy updates

set -e

APP_DIR="/var/www/ai-tech-news"

echo "🚀 Starting deployment..."

cd $APP_DIR

# Pull latest changes (if using Git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main || echo "⚠️  Git pull failed or not configured"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database changes (if schema changed)
echo "🗄️  Updating database schema..."
npx prisma db push --accept-data-loss || echo "⚠️  Database push failed"

# Build application
echo "🏗️  Building application..."
npm run build

# Restart application
echo "🔄 Restarting application..."
pm2 restart ai-tech-news

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status
echo ""
echo "📊 View logs: pm2 logs ai-tech-news"
echo "🌐 Check site: http://YOUR_SERVER_IP"

