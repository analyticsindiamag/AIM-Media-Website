#!/bin/bash

# PM2 Setup Script
# Configures PM2 to run the Next.js app as a service

set -e

APP_DIR="/var/www/ai-tech-news"
SERVICE_NAME="ai-tech-news"

echo "🔧 Setting up PM2..."

cd $APP_DIR

# Stop existing process if running
pm2 delete $SERVICE_NAME 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start npm --name $SERVICE_NAME -- start

# Save PM2 process list
pm2 save

# Setup PM2 startup script
echo "⚙️  Configuring PM2 startup script..."
pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ PM2 setup complete!"
echo ""
echo "📊 Useful commands:"
echo "   pm2 status              - Check app status"
echo "   pm2 logs $SERVICE_NAME  - View logs"
echo "   pm2 restart $SERVICE_NAME - Restart app"
echo "   pm2 stop $SERVICE_NAME  - Stop app"

