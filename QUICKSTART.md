# 🚀 Quick Start Checklist

Follow these steps to get your AI Tech News website running in **10 minutes**!

## ✅ Step-by-Step Setup

### 1️⃣ Create Supabase Account (2 min)
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up for free account
- [ ] Click "New Project"
- [ ] Name: `ai-tech-news`
- [ ] Set database password (save it!)
- [ ] Select region closest to you
- [ ] Wait for project to be created

### 2️⃣ Get Supabase Credentials (1 min)
- [ ] Go to your Supabase project
- [ ] Click **Settings** → **API**
- [ ] Copy these 3 values and paste below:
  - ✅ Project URL: `https://xxxxx.supabase.co`
  - ✅ anon public key: `eyJ...`
  - ✅ service_role key: `eyJ...` (click "Reveal")

### 3️⃣ Create Storage Bucket (1 min)
- [ ] In Supabase, click **Storage** (left sidebar)
- [ ] Click **"New Bucket"**
- [ ] Name: `images`
- [ ] ✅ Check **"Public bucket"**
- [ ] Click **"Create bucket"**

### 4️⃣ Create Environment File (1 min)
- [ ] In your terminal, create `.env.local`:
\`\`\`bash
touch .env.local
\`\`\`

- [ ] Copy this template and fill in your values:
\`\`\`env
# Get DATABASE_URL from Settings → Database → Connection String → URI
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

ADMIN_PASSWORD=change_this_to_secure_password

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="AI Tech News"
\`\`\`

**How to get DATABASE_URL:**
- Go to **Settings** → **Database**
- Scroll to **"Connection string"**
- Click **"URI"** tab
- Replace `[YOUR-PASSWORD]` with your actual database password

### 5️⃣ Install & Setup Database (1 min)
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
\`\`\`

You should see: `✔ Your database is now in sync`

### 6️⃣ Start Development Server (1 min)
\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
▲ Next.js 16.0.0
- Local: http://localhost:3000
✓ Ready in 2.5s
\`\`\`

### 7️⃣ Access Admin Portal (1 min)
- [ ] Open browser to: http://localhost:3000/admin
- [ ] Enter your admin password (from `.env.local`)
- [ ] You're in! 🎉

### 8️⃣ Create Your First Content (2 min)

**Create a Category:**
- [ ] Click **"Categories"** in admin
- [ ] Fill in:
  - Name: `Enterprise AI`
  - Slug will auto-fill: `enterprise-ai`
  - Description: `AI solutions for enterprises`
- [ ] Click **"Create Category"**

**Create an Editor/Author:**
- [ ] Click **"Editors"**
- [ ] Fill in:
  - Name: `Your Name`
  - Email: `you@example.com`
  - Bio: `Your bio here`
  - (Optional) Upload avatar
- [ ] Click **"Create Editor"**

**Create Your First Article:**
- [ ] Click **"Articles"** → **"New Article"**
- [ ] Fill in:
  - Title: `Your First AI Article`
  - Content: Use the rich text editor
  - Upload featured image
  - Select category
  - Select editor
  - Click **"Publish"**

### 9️⃣ View Your Article (30 sec)
- [ ] Go to: http://localhost:3000
- [ ] See your article on the homepage! 🎊

---

## 🎉 You're Done!

### What You Have Now:
✅ Fully functional news website  
✅ Admin portal for content management  
✅ Rich text editor  
✅ Image upload to Supabase  
✅ Category system  
✅ SEO-optimized pages  
✅ Sitemap & RSS feed  
✅ Ready to import WordPress articles  

### Next Steps:
1. **Import existing articles** → `/admin/import`
2. **Customize design** → Edit `app/globals.css`
3. **Change logo** → Edit `components/header.tsx`
4. **Deploy to production** → Push to GitHub → Connect to Vercel

---

## ❌ Troubleshooting

**"Unable to connect to database"**
- Check your `DATABASE_URL` is correct
- Make sure password doesn't have special characters
- Try escaping special characters in password

**"Image upload not working"**
- Verify storage bucket is named exactly `images`
- Check bucket is set to **public**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

**"Admin login not working"**
- Check `ADMIN_PASSWORD` in `.env.local`
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cookies for localhost

**"Prisma errors"**
\`\`\`bash
rm -rf node_modules .next
npm install
npx prisma generate
\`\`\`

---

## 📚 Documentation Files

- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup
- `FEATURES.md` - All features explained
- `PROJECT_SUMMARY.md` - Quick overview

---

**Need help?** Check the troubleshooting section above or review the documentation files.

