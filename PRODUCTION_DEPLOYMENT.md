# AWS Lightsail Production Deployment Guide (SQLite)

Complete step-by-step guide to deploy your AI Tech News application on AWS Lightsail with SQLite database. This setup is **minimal hassle** and uses a local SQLite database - no PostgreSQL setup required!

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create AWS Lightsail Instance](#create-aws-lightsail-instance)
3. [Initial Server Setup](#initial-server-setup)
4. [Configure Database (SQLite)](#configure-database-sqlite)
5. [Upload Application](#upload-application)
6. [Environment Configuration](#environment-configuration)
7. [Deploy Application](#deploy-application)
8. [Configure Nginx](#configure-nginx)
9. [Setup Scheduled Publishing](#setup-scheduled-publishing)
10. [Firewall Configuration](#firewall-configuration)
11. [Verification & Testing](#verification--testing)
12. [Maintenance & Updates](#maintenance--updates)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- AWS Account with Lightsail access
- Basic knowledge of Linux/SSH commands
- Domain name (optional, can use IP address)
- Git repository (optional, can use direct upload)

**Estimated Setup Time**: 20-30 minutes

---

## Create AWS Lightsail Instance

### Step 1: Create Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"**
3. Choose:
   - **Platform**: Linux/Unix
   - **Blueprint**: Ubuntu 22.04 LTS
   - **Instance plan**: 
     - Minimum: **$5/month** (1GB RAM, 1 vCPU) - suitable for small sites
     - Recommended: **$10/month** (2GB RAM, 1 vCPU) - better performance
     - For high traffic: **$20/month** (4GB RAM, 2 vCPU)
4. Name your instance: `ai-tech-news`
5. Click **"Create instance"**
6. Wait for instance to be created (~2 minutes)

### Step 2: Get SSH Access

1. Once instance is running, click on it
2. Go to **"Account"** tab and download your SSH key
3. Save the key file (e.g., `lightsail-key.pem`)
4. Set permissions:
   ```bash
   chmod 400 lightsail-key.pem
   ```
5. Note your instance's **public IP address** (you'll need this)

---

## Initial Server Setup

### Step 1: Connect to Server

```bash
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with your actual IP address.

### Step 2: Run Setup Script

On your **local machine**, upload and run the setup script:

```bash
# Upload setup script
scp -i lightsail-key.pem scripts/setup-server-sqlite.sh ubuntu@YOUR_SERVER_IP:~/

# Connect to server
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP

# Make executable and run
chmod +x setup-server-sqlite.sh
./setup-server-sqlite.sh
```

**OR** manually install everything:

```bash
# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Git
sudo apt-get install -y git

# Install build essentials (for native modules)
sudo apt-get install -y build-essential

# Install SQLite (usually pre-installed, but ensure it's there)
sudo apt-get install -y sqlite3

# Create application directory
sudo mkdir -p /var/www/ai-tech-news
sudo chown -R $USER:$USER /var/www/ai-tech-news

# Create backups directory
mkdir -p /var/www/ai-tech-news/backups
```

**Setup complete!** ✅

---

## Configure Database (SQLite)

SQLite is much simpler than PostgreSQL - no database server setup needed!

### Step 1: Update Prisma Schema

On your **local machine**, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Important**: Change from `postgresql` to `sqlite`.

### Step 2: Database Path

The database file will be located at:
```
/var/www/ai-tech-news/prisma/prod.db
```

We'll configure this in the environment variables.

---

## Upload Application

### Option A: Using Git (Recommended)

```bash
# On server
cd /var/www/ai-tech-news
git clone https://github.com/yourusername/your-repo.git .
```

### Option B: Direct Upload

On your **local machine**:

```bash
# Create deployment archive (excluding unnecessary files)
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='prisma/dev.db' \
    --exclude='test-results' \
    --exclude='.env.local' \
    --exclude='.env' \
    -czf deploy.tar.gz .

# Upload to server
scp -i lightsail-key.pem deploy.tar.gz ubuntu@YOUR_SERVER_IP:~/

# On server, extract
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP
cd /var/www/ai-tech-news
tar -xzf ~/deploy.tar.gz
```

### Option C: Using SCP (for entire directory)

```bash
# On local machine
scp -i lightsail-key.pem -r \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    . ubuntu@YOUR_SERVER_IP:/var/www/ai-tech-news/
```

---

## Environment Configuration

### Step 1: Create Environment File

On the **server**:

```bash
cd /var/www/ai-tech-news
nano .env
```

### Step 2: Configure Environment Variables

Paste this configuration and **update the values**:

```env
# Database (SQLite - file path)
DATABASE_URL="file:./prisma/prod.db"

# Supabase (for file storage - optional but recommended)
# If not using Supabase, you can skip these
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Admin Authentication
# Set a STRONG password for admin access
ADMIN_PASSWORD=your_secure_admin_password_here

# Site Configuration
# Replace YOUR_SERVER_IP with your actual Lightsail IP
NEXT_PUBLIC_SITE_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_SITE_NAME="AI Tech News"

# Node Environment
NODE_ENV=production

# Optional: Mixpanel Analytics
# NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Optional: Scheduled Publishing Endpoint (for cron)
# Used by scheduled article publishing cron job
SCHEDULED_PUBLISH_ENDPOINT=http://localhost:3000/api/articles/scheduled/publish
```

**Important Notes:**
- **DATABASE_URL**: Use `file:./prisma/prod.db` for SQLite
- **ADMIN_PASSWORD**: Choose a strong password for admin access
- **NEXT_PUBLIC_SITE_URL**: Replace with your server IP or domain

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Secure Environment File

```bash
# Restrict access to .env file
chmod 600 .env
```

---

## Deploy Application

### Step 1: Install Dependencies

```bash
cd /var/www/ai-tech-news
npm install --production
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Initialize Database

```bash
# Push schema to database (creates tables)
npx prisma db push

# Seed database with initial data (optional)
npm run seed
```

### Step 4: Build Application

```bash
npm run build
```

This will:
- Generate Prisma client
- Build Next.js application
- Create optimized production bundle

### Step 5: Start Application with PM2

```bash
# Start application
pm2 start npm --name "ai-tech-news" -- start

# Save PM2 configuration to start on reboot
pm2 save
pm2 startup
```

When prompted, copy and run the `sudo` command shown.

### Step 6: Verify Application is Running

```bash
# Check status
pm2 status

# View logs
pm2 logs ai-tech-news

# Check if app is listening on port 3000
curl http://localhost:3000
```

You should see the HTML response from your application.

---

## Configure Nginx

Nginx will serve as a reverse proxy, forwarding requests to your Node.js app.

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ai-tech-news
```

Paste this configuration (replace `YOUR_SERVER_IP`):

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your IP or domain

    # Increase body size for file uploads
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
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
```

**Save and exit** (`Ctrl+X`, `Y`, `Enter`)

### Step 2: Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/ai-tech-news /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Step 3: Verify Nginx is Running

```bash
sudo systemctl status nginx
```

---

## Setup Scheduled Publishing

Articles scheduled for future publication need a cron job to publish them automatically.

### Step 1: Create Cron Job

```bash
# Edit crontab
crontab -e
```

Add this line to call the publish endpoint every minute:

```cron
* * * * * curl -X POST http://localhost:3000/api/articles/scheduled/publish > /dev/null 2>&1
```

**Alternative**: Create a script for better logging:

```bash
# Create publish script
nano /var/www/ai-tech-news/scripts/publish-scheduled.sh
```

Paste:

```bash
#!/bin/bash
curl -X POST http://localhost:3000/api/articles/scheduled/publish >> /var/www/ai-tech-news/logs/scheduled-publish.log 2>&1
```

Make executable:

```bash
chmod +x /var/www/ai-tech-news/scripts/publish-scheduled.sh
mkdir -p /var/www/ai-tech-news/logs
```

Then add to crontab:

```cron
* * * * * /var/www/ai-tech-news/scripts/publish-scheduled.sh
```

Save and exit crontab editor.

### Step 2: Verify Cron Job

```bash
# List cron jobs
crontab -l

# Check cron logs (if available)
sudo tail -f /var/log/syslog | grep CRON
```

---

## Firewall Configuration

### AWS Lightsail Firewall

1. Go to Lightsail console → Your instance → **"Networking"** tab
2. Click **"Add rule"** and add:

   **HTTP (Port 80)**:
   - Application: HTTP
   - Protocol: TCP
   - Port: 80
   - Source: Anywhere (0.0.0.0/0)
   - Click **"Save"**

   **HTTPS (Port 443)** - Optional for SSL:
   - Application: HTTPS
   - Protocol: TCP
   - Port: 443
   - Source: Anywhere (0.0.0.0/0)
   - Click **"Save"**

   **SSH (Port 22)** - Usually already enabled:
   - Application: SSH
   - Protocol: TCP
   - Port: 22
   - Source: Your IP (for security)

### Ubuntu Firewall (UFW) - Optional

```bash
# Enable UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Verification & Testing

### Step 1: Test Application

1. **Open browser** and visit: `http://YOUR_SERVER_IP`
2. You should see your homepage
3. Try accessing: `http://YOUR_SERVER_IP/admin`
4. Login with your `ADMIN_PASSWORD`

### Step 2: Test Scheduled Publishing

1. Create a test article scheduled for 1 minute in the future
2. Wait 1-2 minutes
3. Check if article was published automatically:
   ```bash
   pm2 logs ai-tech-news | grep -i scheduled
   ```

### Step 3: Check Application Logs

```bash
# PM2 logs
pm2 logs ai-tech-news --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Step 4: Verify Database

```bash
# Check SQLite database exists
ls -lh /var/www/ai-tech-news/prisma/prod.db

# View database (optional)
sqlite3 /var/www/ai-tech-news/prisma/prod.db
.tables
.exit
```

---

## Maintenance & Updates

### Regular Updates

```bash
cd /var/www/ai-tech-news

# Pull latest changes (if using Git)
git pull origin main

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Push database changes (if schema changed)
npx prisma db push

# Rebuild application
npm run build

# Restart application
pm2 restart ai-tech-news
```

### Database Backups

Create a backup script:

```bash
nano /var/www/ai-tech-news/scripts/backup-db.sh
```

Paste:

```bash
#!/bin/bash
BACKUP_DIR="/var/www/ai-tech-news/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/prod_$DATE.db"

mkdir -p $BACKUP_DIR
cp /var/www/ai-tech-news/prisma/prod.db $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.db.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

Make executable:

```bash
chmod +x /var/www/ai-tech-news/scripts/backup-db.sh
```

Add to crontab for daily backups:

```bash
crontab -e
# Add: 0 2 * * * /var/www/ai-tech-news/scripts/backup-db.sh
```

### System Updates

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Restart services if needed
sudo systemctl restart nginx
pm2 restart ai-tech-news
```

### Monitor Resources

```bash
# Install monitoring tools
sudo apt-get install -y htop

# View system resources
htop

# Check disk space
df -h

# Check memory
free -h
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs ai-tech-news --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart application
pm2 restart ai-tech-news
```

### Database Errors

```bash
# Check database file exists
ls -lh /var/www/ai-tech-news/prisma/prod.db

# Verify database is readable
sqlite3 /var/www/ai-tech-news/prisma/prod.db "SELECT COUNT(*) FROM articles;"

# Check file permissions
ls -la /var/www/ai-tech-news/prisma/

# Fix permissions if needed
chmod 644 /var/www/ai-tech-news/prisma/prod.db
```

### Nginx Errors

```bash
# Test Nginx configuration
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Can't Access Site

1. **Check firewall rules** in Lightsail console
2. **Verify Nginx is running**: `sudo systemctl status nginx`
3. **Check application is running**: `pm2 status`
4. **Test local connection**: `curl http://localhost:3000`
5. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`

### Out of Memory

```bash
# Check memory usage
free -h

# Enable swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Or upgrade Lightsail instance
```

### Scheduled Articles Not Publishing

```bash
# Check cron job is running
crontab -l

# Test endpoint manually
curl -X POST http://localhost:3000/api/articles/scheduled/publish

# Check logs
tail -f /var/www/ai-tech-news/logs/scheduled-publish.log

# Verify PM2 is running
pm2 status
```

### Permission Errors

```bash
# Fix application directory permissions
sudo chown -R $USER:$USER /var/www/ai-tech-news

# Fix database file permissions
chmod 644 /var/www/ai-tech-news/prisma/prod.db
chmod 755 /var/www/ai-tech-news/prisma/
```

---

## Quick Reference Commands

```bash
# Application Management
pm2 status                    # Check app status
pm2 logs ai-tech-news         # View logs
pm2 restart ai-tech-news      # Restart app
pm2 stop ai-tech-news         # Stop app
pm2 start ai-tech-news        # Start app

# Database Management
npx prisma db push            # Update database schema
npx prisma generate           # Generate Prisma client
npx prisma studio             # Open database GUI (development)

# Nginx Management
sudo nginx -t                 # Test configuration
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl status nginx   # Check status

# System Monitoring
htop                          # Monitor resources
df -h                         # Check disk space
free -h                       # Check memory
```

---

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | SQLite database path | Yes | `file:./prisma/prod.db` |
| `ADMIN_PASSWORD` | Admin login password | Yes | `your_secure_password` |
| `NEXT_PUBLIC_SITE_URL` | Site URL | Yes | `http://YOUR_SERVER_IP` |
| `NEXT_PUBLIC_SITE_NAME` | Site name | Yes | `"AI Tech News"` |
| `NODE_ENV` | Node environment | Yes | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | No | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | No | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | No | `eyJ...` |
| `NEXT_PUBLIC_MIXPANEL_TOKEN` | Mixpanel token | No | `xxx` |

---

## Deployment Checklist

- [ ] AWS Lightsail instance created
- [ ] SSH access configured
- [ ] Server setup completed (Node.js, PM2, Nginx)
- [ ] Prisma schema updated to use SQLite
- [ ] Application files uploaded
- [ ] Environment variables configured
- [ ] Database initialized (`npx prisma db push`)
- [ ] Application built (`npm run build`)
- [ ] PM2 configured and running
- [ ] Nginx configured and running
- [ ] Scheduled publishing cron job set up
- [ ] Firewall rules configured
- [ ] Application accessible via IP
- [ ] Admin portal working
- [ ] Database backups configured

---

## Security Best Practices

1. **Strong Passwords**: Use strong `ADMIN_PASSWORD`
2. **Firewall**: Only allow necessary ports (80, 443, 22)
3. **SSH Keys**: Use SSH keys instead of passwords
4. **Regular Updates**: Run `sudo apt-get update && sudo apt-get upgrade` regularly
5. **Backups**: Set up automated database backups
6. **HTTPS**: Consider setting up SSL certificate (Let's Encrypt) for HTTPS
7. **File Permissions**: Restrict `.env` file access (`chmod 600 .env`)

---

## Next Steps

1. **Set up SSL/HTTPS**: Use Let's Encrypt for free SSL certificates
2. **Configure Domain**: Point your domain to the Lightsail IP
3. **Set up Monitoring**: Use PM2 monitoring or external services
4. **Enable Logging**: Configure centralized logging
5. **Scale Up**: Upgrade instance if traffic increases

---

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs ai-tech-news`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables: `cat .env`
4. Test database: `sqlite3 prisma/prod.db "SELECT COUNT(*) FROM articles;"`
5. Check system resources: `htop`

---

**Congratulations!** Your application is now running on AWS Lightsail with SQLite! 🎉

The setup is complete and ready for production use. Regular maintenance and backups will keep your site running smoothly.

