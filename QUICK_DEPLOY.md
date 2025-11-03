# Quick Deployment Reference

## 🚀 One-Command Deployment (After Initial Setup)

```bash
# On AWS Lightsail instance
cd /var/www/ai-tech-news && ./scripts/deploy.sh
```

## 📋 Initial Setup Commands

```bash
# 1. Connect to server
ssh -i lightsail-key.pem ubuntu@YOUR_SERVER_IP

# 2. Run server setup
./setup-server.sh

# 3. Upload application files (from local machine)
scp -i lightsail-key.pem -r . ubuntu@YOUR_SERVER_IP:/var/www/ai-tech-news/

# 4. Configure environment
cd /var/www/ai-tech-news
cp env.production.template .env
nano .env  # Edit with your values

# 5. First deployment
./scripts/first-deploy.sh YOUR_SERVER_IP
```

## 🔍 Common Commands

```bash
# Application
pm2 status
pm2 logs ai-tech-news
pm2 restart ai-tech-news

# Database
sudo -u postgres psql -d aitechnews
sudo systemctl status postgresql

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Logs
pm2 logs ai-tech-news --lines 50
sudo tail -f /var/log/nginx/error.log
```

## 🌐 Access URLs

- Application: http://YOUR_SERVER_IP
- Admin Portal: http://YOUR_SERVER_IP/admin
- Health Check: http://YOUR_SERVER_IP/health

## 🧪 E2E Testing

```bash
# From local machine
BASE_URL=http://YOUR_SERVER_IP npm run test:e2e:production
```

## 📝 File Locations

- Application: `/var/www/ai-tech-news`
- Environment: `/var/www/ai-tech-news/.env`
- Logs: `pm2 logs ai-tech-news`
- Nginx Config: `/etc/nginx/sites-available/ai-tech-news`

