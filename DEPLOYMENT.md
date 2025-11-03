# AWS Lightsail Deployment Guide

Complete guide for deploying your AI Tech News application on AWS Lightsail.

## 📋 Prerequisites

- AWS Account with Lightsail access
- Basic knowledge of Linux commands
- SSH access to your Lightsail instance

## 🚀 Step 1: Create AWS Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"**
3. Choose:
   - **Platform**: Linux/Unix
   - **Blueprint**: Ubuntu 22.04 LTS
   - **Instance plan**: At least $5/month (1GB RAM, 1 vCPU) - recommended: $10/month (2GB RAM, 1 vCPU)
4. Name your instance: `ai-tech-news`
5. Click **"Create instance"**
6. Wait for instance to be created (~2 minutes)

## 🔐 Step 2: Configure SSH Access

1. Once the instance is running, click on it
2. Go to **"Account"** tab and download your SSH key
3. Save the key file (e.g., `lightsail-key.pem`)
4. Set permissions: `chmod 400 lightsail-key.pem`
5. Note your instance's **public IP address**

## 📦 Step 3: Initial Server Setup

### Connect to your instance:

```bash
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP
```

### Run the setup script:

```bash
# On your local machine, upload the setup script
scp -i lightsail-key.pem scripts/setup-server.sh ubuntu@YOUR_SERVER_IP:~/

# On the server, make it executable and run
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP
chmod +x setup-server.sh
./setup-server.sh
```

**⚠️ Important**: When prompted, set a secure password for PostgreSQL user `aitechnews_user`

To change the password manually:
```bash
sudo -u postgres psql
ALTER USER aitechnews_user WITH PASSWORD 'your_secure_password';
\q
```

## 📁 Step 4: Upload Your Application

### Option A: Using Git (Recommended)

```bash
# On your local machine
cd /path/to/your/project

# Create a deployment archive (excluding node_modules, .next, etc.)
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='prisma/dev.db' \
    --exclude='test-results' \
    -czf deploy.tar.gz .

# Upload to server
scp -i lightsail-key.pem deploy.tar.gz ubuntu@YOUR_SERVER_IP:~/

# On server, extract and move to app directory
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP
cd /var/www/ai-tech-news
tar -xzf ~/deploy.tar.gz
```

### Option B: Using Git Clone (If using GitHub/GitLab)

```bash
# On server
cd /var/www/ai-tech-news
git clone https://github.com/yourusername/your-repo.git .
```

## ⚙️ Step 5: Configure Environment Variables

```bash
# On server
cd /var/www/ai-tech-news
cp .env.production.example .env
nano .env  # or use your preferred editor
```

Fill in the `.env` file with your values:

```env
# Database (replace YOUR_PASSWORD with the password you set)
DATABASE_URL="postgresql://aitechnews_user:YOUR_PASSWORD@localhost:5432/aitechnews"

# Supabase (if using - optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin password (use a strong password!)
ADMIN_PASSWORD=your_secure_password

# Site URL (replace with your server IP)
NEXT_PUBLIC_SITE_URL=http://YOUR_SERVER_IP
NEXT_PUBLIC_SITE_NAME="AI Tech News"

NODE_ENV=production
```

**Save and exit** (Ctrl+X, then Y, then Enter for nano)

## 🌱 Step 6: First Deployment

```bash
# On server
cd /var/www/ai-tech-news

# Make scripts executable
chmod +x scripts/*.sh

# Run first deployment
./scripts/first-deploy.sh YOUR_SERVER_IP
```

This script will:
- Install dependencies
- Generate Prisma client
- Create database tables
- Seed the database with initial data
- Build the application
- Start the app with PM2
- Configure Nginx

## 🔥 Step 7: Configure Firewall

AWS Lightsail has a built-in firewall. Configure it:

1. Go to Lightsail console → Your instance → **"Networking"** tab
2. Click **"Add rule"**
3. Add:
   - **Application**: HTTP
   - **Protocol**: TCP
   - **Port**: 80
   - Click **"Save"**

## ✅ Step 8: Verify Deployment

1. Open your browser and visit: `http://YOUR_SERVER_IP`
2. You should see your application running!
3. Check admin portal: `http://YOUR_SERVER_IP/admin`
4. Login with your `ADMIN_PASSWORD`

## 🔄 Step 9: Future Deployments

For future updates, use the deployment script:

```bash
# On server
cd /var/www/ai-tech-news
./scripts/deploy.sh
```

Or manually:
```bash
cd /var/www/ai-tech-news
git pull  # if using git
npm ci
npx prisma generate
npx prisma db push
npm run seed  # if you want to re-seed
npm run build
pm2 restart ai-tech-news
```

## 🧪 Step 10: Running E2E Tests

### On your local machine:

```bash
# Set the base URL to your Lightsail instance
BASE_URL=http://YOUR_SERVER_IP npm run test:e2e:production
```

Or update `playwright.production.config.ts` with your IP and run:
```bash
npm run test:e2e:production
```

## 📊 Useful Commands

### Check application status:
```bash
pm2 status
pm2 logs ai-tech-news
```

### Restart application:
```bash
pm2 restart ai-tech-news
```

### Check Nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

### Check PostgreSQL:
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d aitechnews
```

### View application logs:
```bash
pm2 logs ai-tech-news --lines 100
```

### Monitor system resources:
```bash
htop  # or install with: sudo apt install htop
```

## 🔒 Security Best Practices

1. **Change default passwords**: Ensure PostgreSQL password is strong
2. **Firewall**: Only allow necessary ports (80, 443, 22)
3. **Regular updates**: Run `sudo apt update && sudo apt upgrade` regularly
4. **SSH keys**: Use SSH keys instead of passwords
5. **HTTPS**: Consider setting up SSL certificate (Let's Encrypt) for HTTPS
6. **Backups**: Set up regular database backups

## 🗄️ Database Backups

Create a backup script:

```bash
# On server
cd /var/www/ai-tech-news
mkdir -p backups

# Create backup script
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/ai-tech-news/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/aitechnews_$DATE.sql"

mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump aitechnews > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
EOF

chmod +x scripts/backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /var/www/ai-tech-news/scripts/backup-db.sh
```

## 🐛 Troubleshooting

### Application won't start:
```bash
pm2 logs ai-tech-news
# Check for errors in logs
```

### Database connection errors:
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U aitechnews_user -d aitechnews
```

### Nginx errors:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Port already in use:
```bash
# Check what's using port 3000
sudo lsof -i :3000
# Kill if needed
pm2 delete ai-tech-news
pm2 start npm --name ai-tech-news -- start
```

### Out of memory:
- Upgrade to a larger Lightsail instance
- Or enable swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (http://IP) | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site name | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (if using) | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | No |
| `NODE_ENV` | Set to `production` | Yes |

## 🎯 Quick Checklist

- [ ] AWS Lightsail instance created
- [ ] SSH access configured
- [ ] Server setup script run
- [ ] Application files uploaded
- [ ] Environment variables configured
- [ ] First deployment completed
- [ ] Firewall rules configured
- [ ] Application accessible via IP
- [ ] Admin portal working
- [ ] Seed data present
- [ ] E2E tests passing

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs ai-tech-news`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all environment variables are set correctly
4. Ensure database is running and accessible

---

**Congratulations!** Your application should now be running on AWS Lightsail! 🎉

