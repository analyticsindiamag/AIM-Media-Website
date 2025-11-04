# Migration Guide for New Features

This guide explains how to migrate your database to support the new features:
1. Article scheduling
2. Editor pages with slugs
3. Social media sharing (already implemented)
4. Sticky header (already implemented)

## Database Migration

### Step 1: Run Prisma Migration

Run the following commands to update your database schema:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_scheduling_and_editor_slugs

# Or if using production database
npx prisma migrate deploy
```

### Step 2: Update Existing Editors

After migrating, existing editors will need slugs. You can either:

**Option A: Generate slugs automatically** (Recommended)
Run this script to update all existing editors:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateEditors() {
  const editors = await prisma.editor.findMany();
  
  for (const editor of editors) {
    if (!editor.slug) {
      const slug = editor.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      let uniqueSlug = slug;
      let counter = 1;
      while (await prisma.editor.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = \`\${slug}-\${counter}\`;
        counter++;
      }
      
      await prisma.editor.update({
        where: { id: editor.id },
        data: { slug: uniqueSlug }
      });
      
      console.log(\`Updated editor \${editor.name} with slug: \${uniqueSlug}\`);
    }
  }
  
  await prisma.\$disconnect();
}

updateEditors().catch(console.error);
"
```

**Option B: Update manually via admin panel**
New editors created through the admin panel will automatically get slugs.

## Scheduled Articles

### How It Works

1. **Creating Scheduled Articles**: When creating or editing an article, you can set a `scheduledAt` date/time. The article will not be published immediately but will be scheduled for publication.

2. **Publishing Scheduled Articles**: Articles are published automatically when their `scheduledAt` time arrives. This requires a background job.

### Setting Up Scheduled Publishing

You need to call the publish endpoint periodically to publish scheduled articles. Here are options:

**Option A: Cron Job** (Recommended for production)
Set up a cron job to call the endpoint every minute:

```bash
# Add to crontab (crontab -e)
* * * * * curl -X POST https://your-domain.com/api/articles/scheduled/publish
```

**Option B: Vercel Cron Jobs**
If using Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/articles/scheduled/publish",
    "schedule": "* * * * *"
  }]
}
```

**Option C: Manual Trigger**
You can manually trigger publishing by calling:
```bash
curl -X POST http://localhost:3000/api/articles/scheduled/publish
```

**Option D: Next.js API Route with ISR**
Create a route that calls itself periodically (less reliable):

```typescript
// app/api/cron/route.ts
export async function GET() {
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/articles/scheduled/publish`, {
    method: 'POST'
  });
  return Response.json({ ok: true });
}
```

## New Features Summary

### 1. Article Scheduling ✅
- Added `scheduledAt` field to Article model
- Admin forms now include date/time picker for scheduling
- Articles with `scheduledAt` set will not publish immediately
- Use the publish endpoint to publish scheduled articles

### 2. Social Media Sharing ✅
- ShareButtons component integrated into article pages
- Supports X (Twitter), LinkedIn, Facebook
- Copy link functionality
- Native share API support (mobile)

### 3. Editor Pages ✅
- Added `slug` field to Editor model
- New route: `/editor/[slug]`
- Shows editor bio, avatar, and all their articles
- Editor names throughout the site now link to editor pages

### 4. Sticky Header ✅
- Header already had `sticky top-0 z-50` classes
- Header remains visible when scrolling

## Testing

After migration, test the following:

1. **Create a scheduled article**:
   - Go to `/admin/articles/new`
   - Fill in article details
   - Set a future date/time in "Schedule for later"
   - Click "Schedule"
   - Verify article is not published immediately

2. **Test editor pages**:
   - Click on any editor name in an article
   - Should navigate to `/editor/[slug]`
   - Verify editor info and articles are displayed

3. **Test social sharing**:
   - View any article
   - Click share buttons in the header
   - Verify links work correctly

4. **Test sticky header**:
   - Scroll down any page
   - Header should remain visible at top

## Troubleshooting

### Editor slugs missing
If you see errors about missing editor slugs, run the update script from Step 2.

### Scheduled articles not publishing
- Verify the cron job is running
- Check the publish endpoint logs
- Manually trigger publishing to test

### Migration errors
- Ensure Prisma client is generated: `npx prisma generate`
- Check database connection
- Verify schema.prisma is correct

