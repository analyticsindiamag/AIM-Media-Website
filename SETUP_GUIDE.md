# Quick Setup Guide

This guide will get you up and running in 10 minutes!

## Step 1: Install Dependencies (2 min)

\`\`\`bash
npm install
\`\`\`

## Step 2: Set Up Supabase (3 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Set a project name and database password
4. Wait for project to be created (~1-2 min)

### Get Your Credentials

1. Click on your project
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**
   - **anon public key**
   - **service_role key** (click "Reveal" first)

### Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click "New Bucket"
3. Name it `images`
4. Make it **public**
5. Click "Create Bucket"

## Step 3: Configure Environment Variables (1 min)

Create a file called `.env.local` in the root folder:

\`\`\`env
# Replace with your Supabase values
DATABASE_URL="postgresql://postgres:[YOUR-DB-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Set your admin password
ADMIN_PASSWORD=admin123

# Local config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="AI Tech News"
\`\`\`

**How to get DATABASE_URL:**
1. In Supabase, go to **Settings** → **Database**
2. Scroll down to "Connection String" → "URI"
3. Copy it and replace `[YOUR-PASSWORD]` with your database password

## Step 4: Set Up Database (2 min)

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
\`\`\`

This creates all the tables you need!

## Step 5: Run the Development Server (1 min)

\`\`\`bash
npm run dev
\`\`\`

Visit:
- **Homepage**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin

## Step 6: Create Your First Article (1 min)

1. Go to http://localhost:3000/admin
2. Enter your admin password (`admin123` if you used the example)
3. Click **Categories** → Add a category (e.g., "AI News")
4. Click **Editors** → Add yourself as an editor
5. Click **Articles** → **New Article**
6. Fill in the form and click **Publish**!

## 🎉 You're Done!

Your site is now running with:
- ✅ Public homepage
- ✅ Article pages with SEO
- ✅ Admin portal
- ✅ Image upload
- ✅ Category system
- ✅ Sitemap & RSS

## Next Steps

### Import Existing Articles

If you have WordPress articles:
1. Export them as CSV
2. Go to `/admin/import`
3. Upload the CSV

### Deploy to Production

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repo
4. Add environment variables (same as `.env.local` but with production URLs)
5. Deploy!

### Change the Design

Edit these files:
- `app/globals.css` - Colors and fonts
- `components/header.tsx` - Logo and navigation
- `components/footer.tsx` - Footer content

## Troubleshooting

### Can't connect to database?
- Check your `DATABASE_URL` is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Verify the project ref matches your Supabase project

### Images not uploading?
- Check Supabase Storage bucket is named `images`
- Verify bucket is set to **public**
- Check your service_role key is correct

### Admin login not working?
- Check `ADMIN_PASSWORD` in `.env.local`
- Clear your browser cookies
- Restart the dev server

### Build errors?
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then `npm install`
- Make sure Node.js version is 18+

## Need Help?

Check the full README.md for detailed documentation!

