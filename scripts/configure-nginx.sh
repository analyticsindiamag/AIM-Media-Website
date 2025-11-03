#!/bin/bash

# Nginx Configuration Script for AWS Lightsail
# This script configures Nginx as a reverse proxy for the Next.js app

set -e

APP_DIR="/var/www/ai-tech-news"
DOMAIN_OR_IP=${1:-"your-server-ip"}

echo "🔧 Configuring Nginx..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/ai-tech-news > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_OR_IP;

    # Increase body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ai-tech-news /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx
sudo systemctl enable nginx

echo "✅ Nginx configured successfully!"
echo "🌐 Your app should now be accessible at: http://$DOMAIN_OR_IP"

