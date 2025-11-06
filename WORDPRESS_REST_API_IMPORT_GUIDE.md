# WordPress REST API Import Guide

## Overview

The WordPress REST API importer automatically migrates all your WordPress content (users/authors, categories, and posts/articles) with a single URL. You don't need to provide separate URLs for each data type.

## Quick Start

1. **Navigate to Import Page**
   - Go to `/admin/import/rest` in your admin panel
   - Or click "Use REST API Import" on the main import page

2. **Enter WordPress Site URL**
   - Enter your WordPress site URL in any of these formats:
     - `aimmediahouse.com`
     - `https://aimmediahouse.com`
     - `https://aimmediahouse.com/wp-json`
     - `https://aimmediahouse.com/wp-json/wp/v2/posts` (works too!)
   
   **Important:** You only need ONE URL - the tool automatically handles all endpoints!

3. **Test Connection**
   - Click "Test Connection" button to verify the WordPress REST API is accessible
   - This tests if the API is available and returns valid data

4. **Authentication (Optional)**
   - If your WordPress site requires authentication, enter:
     - **Username**: Your WordPress username
     - **Application Password**: Generate this in WordPress → Users → Your Profile → Application Passwords
   - If your WordPress REST API is public (default), you can leave these blank

5. **Start Import**
   - Click "Start Import" button
   - The tool will automatically:
     1. Fetch all users/authors from WordPress
     2. Fetch all categories
     3. Fetch all published posts (and scheduled posts if configured)
     4. Import them in the correct order (users → categories → articles)

## What Gets Imported

### Automatically Imported

✅ **Users/Authors** → Editors
- Name, email, slug, bio, avatar
- Automatically matched or created

✅ **Categories** → Categories  
- Name, slug, description
- Automatically matched or created

✅ **Posts/Articles** → Articles
- Title, content, excerpt, slug
- Publication date, status
- Featured image (with metadata: alt text, caption, etc.)
- SEO meta fields (if using Yoast SEO)
- Author assignment
- Category assignment (uses first category if multiple)

### Import Order

The importer follows this order automatically:

1. **Step 1**: Import Users/Authors
   - Creates Editor records
   - Maps WordPress User ID → Editor ID

2. **Step 2**: Import Categories
   - Creates Category records
   - Maps WordPress Category ID → Category ID

3. **Step 3**: Import Posts/Articles
   - Links to Editors (via author ID mapping)
   - Links to Categories (via category ID mapping)
   - Fetches featured media metadata

## WordPress REST API Endpoints Used

The importer automatically calls these endpoints:

- `GET /wp-json/wp/v2/users` - Fetches all users/authors
- `GET /wp-json/wp/v2/categories` - Fetches all categories
- `GET /wp-json/wp/v2/posts` - Fetches all posts
- `GET /wp-json/wp/v2/media/{id}` - Fetches featured image metadata

**You don't need to know these - the tool handles everything!**

## URL Format Examples

All of these work - pick the simplest:

✅ `aimmediahouse.com`
✅ `https://aimmediahouse.com`
✅ `https://aimmediahouse.com/wp-json`
✅ `https://aimmediahouse.com/wp-json/wp/v2/posts`

The tool normalizes them all to: `https://aimmediahouse.com/wp-json`

## Authentication Setup (If Needed)

If your WordPress REST API requires authentication:

1. **Go to WordPress Admin**
   - Navigate to: Users → Your Profile

2. **Generate Application Password**
   - Scroll to "Application Passwords" section
   - Enter a name (e.g., "Next.js Import")
   - Click "Add New Application Password"
   - Copy the generated password (you'll only see it once!)

3. **Use in Import Tool**
   - Username: Your WordPress username
   - Application Password: The password you just generated

## Import Options

- **Skip Existing**: If checked, won't update existing items (only creates new ones)
- **Import Status**: By default imports `publish` and `future` status posts

## Troubleshooting

### 404 Errors

If you get 404 errors, check:

1. **WordPress REST API is Enabled**
   - Visit: `https://yoursite.com/wp-json/wp/v2`
   - Should return JSON (not 404)

2. **Correct URL Format**
   - Try just the domain: `aimmediahouse.com`
   - The tool will add `/wp-json` automatically

3. **CORS Issues** (if hosted on different domain)
   - WordPress may need CORS headers configured
   - Check server logs for CORS errors

### Connection Timeout

- WordPress site might be slow
- Try during off-peak hours
- Check if WordPress site is accessible from your server

### Authentication Errors

- Verify Application Password is correct
- Check WordPress user has proper permissions
- Try regenerating Application Password

## What Happens During Import

1. **Connection Test**: Verifies WordPress REST API is accessible
2. **Fetch Users**: Gets all WordPress users (paginated automatically)
3. **Import Users**: Creates/updates Editor records
4. **Fetch Categories**: Gets all WordPress categories
5. **Import Categories**: Creates/updates Category records
6. **Fetch Posts**: Gets all WordPress posts (paginated automatically)
7. **For Each Post**:
   - Fetch featured media metadata (if exists)
   - Map author to Editor
   - Map category to Category
   - Calculate read time
   - Create/update Article record

## Progress Tracking

The import shows:
- **Users/Editors**: Total, successful, failed, created, updated
- **Categories**: Total, successful, failed, created, updated  
- **Articles**: Total, successful, failed, created, updated

Each section can be expanded to see details of imported items.

## Best Practices

1. **Test First**: Always test connection before full import
2. **Backup**: Backup your database before importing
3. **Start Small**: Test with a few posts first
4. **Check Results**: Review imported items after import completes
5. **Verify Images**: Check that featured images are accessible

## Example Workflow

```
1. Go to /admin/import/rest
2. Enter: aimmediahouse.com
3. Click "Test Connection" → Success!
4. Leave username/password blank (public API)
5. Uncheck "Skip Existing" (to update existing items)
6. Click "Start Import"
7. Wait for import to complete (shows progress)
8. Review results → All imported successfully!
9. Check /admin/articles to see imported articles
```

## Notes

- **Duplicates**: Articles with same slug will be updated (not duplicated)
- **Missing Categories**: If a post has no category, it's assigned to "General"
- **Missing Authors**: If author not found, import will fail for that post (check errors)
- **Large Imports**: Tool handles pagination automatically (100 items per page)
- **Rate Limiting**: Adds 200ms delay between requests to avoid overwhelming WordPress

