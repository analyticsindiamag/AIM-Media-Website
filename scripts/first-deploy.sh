#!/bin/bash

# First Deployment Script
# Complete setup script for initial deployment on AWS Lightsail

set -e

APP_DIR="/var/www/ai-tech-news"
DOMAIN_OR_IP=${1:-"your-server-ip"}

echo "🚀 Starting first deployment process..."

# Check if directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "📁 Creating application directory..."
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

cd $APP_DIR

# Copy application files (if not already present)
if [ ! -f "package.json" ]; then
    echo "📥 Copying application files..."
    echo "   Please ensure you've uploaded your project files to $APP_DIR"
    echo "   You can use: scp -r . user@your-server-ip:$APP_DIR"
    read -p "Press Enter to continue after uploading files..."
fi

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "   Creating .env.example template..."
    cat > .env.example <<EOF
# Database (PostgreSQL)
DATABASE_URL="postgresql://aitechnews_user:YOUR_PASSWORD@localhost:5432/aitechnews"

# Supabase (for file storage - optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Authentication
ADMIN_PASSWORD=your_secure_password_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://$DOMAIN_OR_IP
NEXT_PUBLIC_SITE_NAME="AI Tech News"

# Node Environment
NODE_ENV=production
EOF
    echo "   Please create .env file with your configuration"
    echo "   Copy .env.example to .env and fill in the values"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Setting up database..."
npx prisma db push --accept-data-loss

# Seed database
echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seed failed, continuing..."

# Build the application
echo "🏗️  Building application..."
npm run build

# Setup PM2
echo "⚙️  Setting up PM2..."
pm2 start npm --name ai-tech-news -- start
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER | tail -1 | sudo bash || true

# Configure Nginx
echo "🌐 Configuring Nginx..."
./scripts/configure-nginx.sh $DOMAIN_OR_IP || {
    echo "⚠️  Nginx configuration failed. Please run manually:"
    echo "   ./scripts/configure-nginx.sh $DOMAIN_OR_IP"
}

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || echo "your-server-ip")

echo ""
echo "✅ First deployment complete!"
echo ""
echo "🌐 Your application should be accessible at:"
echo "   http://$SERVER_IP"
echo ""
echo "📊 Check application status:"
echo "   pm2 status"
echo ""
echo "📝 View logs:"
echo "   pm2 logs ai-tech-news"

