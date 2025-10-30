# AI Tech News - Next.js News Website

A high-performance, SEO-optimized news website built with Next.js 15, designed for AI and technology content. Features a modern admin portal for content management, inspired by AIM Media House design.

## ✨ Features

### Public Site
- 🎨 **Modern Magazine Layout** - Hero article with sidebar, grid layouts
- ⚡ **Optimized Performance** - ISR, static generation, image optimization
- 🔍 **SEO Best Practices** - Meta tags, Schema.org markup, sitemap, RSS
- 📱 **Fully Responsive** - Mobile-first design
- 🎯 **Category Pages** - Organized content by categories
- 📊 **Article Pages** - Rich content with author bios, related articles

### Admin Portal
- 🔐 **Simple Authentication** - Password-based access
- ✍️ **Rich Text Editor** - Tiptap-powered WYSIWYG editor
- 📸 **Image Upload** - Supabase Storage integration
- 📁 **Category Management** - Create and organize categories
- 👥 **Editor Management** - Manage authors/editors
- 📥 **WordPress Import** - Bulk import from CSV
- 📈 **Dashboard** - Overview of articles, views, stats

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Rich Text Editor**: Tiptap
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd port
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from Settings → API
3. Create a storage bucket named `images` (public)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Admin Authentication
ADMIN_PASSWORD=your_secure_admin_password_here

# Site Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="AI Tech News"
\`\`\`

### 5. Set Up Database

Run Prisma migrations:

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 6. Seed Initial Data (Optional)

Create initial categories and editors:

\`\`\`bash
# You can use the admin portal or run a seed script
node prisma/seed.js  # If you create one
\`\`\`

### 7. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit:
- **Public Site**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

## 📝 Usage

### Creating Your First Article

1. Go to `/admin` and log in with your admin password
2. Click "Categories" and create at least one category (e.g., "Enterprise AI")
3. Click "Editors" and create at least one author/editor
4. Click "Articles" → "New Article"
5. Fill in the article details, upload an image, write content
6. Click "Publish"

### Importing from WordPress

1. Export your WordPress posts as CSV
2. Go to `/admin/import`
3. Upload the CSV file
4. The system will automatically create categories and editors as needed

### WordPress CSV Format

Your CSV should have these columns:
- `post_title` - Article title
- `post_content` - Article content (can include HTML)
- `post_excerpt` - Short summary
- `post_author` - Author name
- `category` - Category name
- `post_date` - Publication date
- `featured_image_url` - Image URL

## 🎨 Customization

### Changing Colors

Edit `app/globals.css` to modify the color scheme:

\`\`\`css
:root {
  --color-aim-blue: oklch(0.5 0.2 250);
  --color-aim-purple: oklch(0.5 0.2 290);
  /* Add your colors */
}
\`\`\`

### Changing Fonts

Edit `app/globals.css` to use different fonts:

\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=Your+Font:wght@400;700&display=swap');

.font-serif {
  font-family: 'Your Font', serif;
}
\`\`\`

### Logo

Replace the logo in `components/header.tsx` and `components/admin/admin-nav.tsx`

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Install dependencies
- Run builds
- Handle ISR and caching
- Provide a production URL

### Environment Variables in Production

Make sure to set all environment variables in your Vercel project settings:
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL` (your production domain)
- `NEXT_PUBLIC_SITE_NAME`

## 📊 Performance Optimizations

- **ISR (Incremental Static Regeneration)**: Pages revalidate every 60 seconds
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Static Generation**: Article and category pages are pre-rendered
- **Code Splitting**: Automatic by Next.js
- **Font Optimization**: Variable fonts with next/font

## 🔍 SEO Features

- ✅ Dynamic meta tags for all pages
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Schema.org NewsArticle markup
- ✅ Automatic sitemap generation (`/sitemap.xml`)
- ✅ robots.txt configuration
- ✅ RSS feed (`/rss.xml`)
- ✅ Semantic HTML structure
- ✅ Optimized page titles and descriptions

## 📁 Project Structure

\`\`\`
port/
├── app/
│   ├── admin/           # Admin portal pages
│   ├── api/             # API routes
│   ├── article/[slug]/  # Article detail pages
│   ├── category/[slug]/ # Category pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   ├── sitemap.ts       # Sitemap generation
│   ├── robots.ts        # Robots.txt
│   └── rss.xml/         # RSS feed
├── components/
│   ├── admin/           # Admin components
│   ├── ui/              # Shadcn UI components
│   ├── article-card.tsx # Article card component
│   ├── header.tsx       # Site header
│   └── footer.tsx       # Site footer
├── lib/
│   ├── prisma.ts        # Prisma client
│   ├── supabase.ts      # Supabase client
│   └── auth.ts          # Auth utilities
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Make sure all environment variables are set correctly
3. Verify your Supabase connection
4. Check the browser console and server logs for errors

## 🎯 Roadmap

- [ ] User authentication for comments
- [ ] Comment system
- [ ] Article search functionality
- [ ] Newsletter subscription
- [ ] Social sharing buttons
- [ ] Related articles by tags
- [ ] Article bookmarking
- [ ] Reading progress bar
- [ ] Dark mode
- [ ] Multi-language support

## 📸 Screenshots

### Homepage
![Homepage](docs/homepage.png)

### Article Page
![Article](docs/article.png)

### Admin Dashboard
![Admin](docs/admin.png)

---

Built with ❤️ using Next.js 15
