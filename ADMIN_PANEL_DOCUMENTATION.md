# Admin Panel Functionalities - Complete Documentation

## Overview
The admin panel is a comprehensive content management system built with Next.js, providing full CRUD operations for articles, categories, editors, subscribers, sponsored banners, and site settings. This document details every functionality, how it's wired, and how changes are reflected in the system.

---

## 1. Authentication System

### 1.1 Admin Login
**Location:** `/app/admin/login/page.tsx`  
**API:** `/app/api/admin/login/route.ts`

**Functionality:**
- Simple password-based authentication using environment variable `ADMIN_PASSWORD`
- Password is sent via POST request to `/api/admin/login`
- On success, sets an HTTP-only cookie `admin-auth` with value `authenticated`
- Cookie expires in 7 days
- Supports redirect parameter `?from=/admin/articles` to redirect after login

**How it works:**
1. User enters password in login form
2. Form submits to `/api/admin/login` with password
3. Backend compares password with `process.env.ADMIN_PASSWORD`
4. If match, `setAdminAuth()` sets cookie via `cookies().set()`
5. Cookie is httpOnly, secure in production, sameSite: 'lax'
6. User redirected to dashboard or `from` parameter URL

**Changes Reflected:**
- Sets authentication cookie
- Redirects to admin dashboard
- Subsequent admin page requests work without re-authentication

**Note:** Currently, admin routes don't appear to have server-side authentication checks, which is a potential security gap.

---

### 1.2 Admin Logout
**Location:** `components/admin/admin-nav.tsx` (logout button)  
**API:** `/app/api/admin/logout/route.ts`

**Functionality:**
- Logout button in admin navigation sidebar
- Calls `/api/admin/logout` POST endpoint
- Clears the `admin-auth` cookie
- Redirects to `/admin/login`

**How it works:**
1. User clicks logout button
2. `handleLogout()` calls `/api/admin/logout`
3. Backend calls `clearAdminAuth()` which deletes the cookie
4. Frontend redirects to login page

---

## 2. Dashboard

### 2.1 Admin Dashboard
**Location:** `/app/admin/page.tsx`

**Functionality:**
- Displays overview statistics:
  - Total Articles count
  - Published Articles count
  - Total Categories count
  - Total Editors count
- Shows recent 10 articles in a table with:
  - Title, Category, Author, Status (Published/Draft), Views
  - Edit link for each article
- Quick action button to create new article

**How it works:**
1. Server-side rendering fetches counts and recent articles using Prisma
2. Uses `Promise.all()` for parallel queries
3. Recent articles include category and editor relations
4. Statistics displayed in card layout
5. Articles table shows status badges (green for published, yellow for draft)

**Data Flow:**
- `prisma.article.count()` - Total articles
- `prisma.article.count({ where: { published: true } })` - Published count
- `prisma.category.count()` - Categories count
- `prisma.editor.count()` - Editors count
- `prisma.article.findMany({ take: 10, orderBy: { createdAt: 'desc' } })` - Recent articles

**Changes Reflected:**
- Real-time counts update when data changes
- Recent articles list updates immediately after article creation/update

---

## 3. Articles Management

### 3.1 Articles List
**Location:** `/app/admin/articles/page.tsx`  
**API:** `/app/api/articles/route.ts` (GET)

**Functionality:**
- Lists all articles in a table
- Shows: Title, Category, Author, Status, Featured status, Views, Actions
- Actions: View (opens article on frontend), Edit, Delete, Set Featured
- Client-side data fetching and state management
- Empty state with "Create Article" button

**How it works:**
1. Component mounts, calls `fetchArticles()`
2. Fetches from `/api/articles` GET endpoint
3. Backend returns all articles with category and editor relations
4. Articles displayed in table format
5. Featured toggle: clicking "Set Featured" sets that article as featured (unsetting others)

**API Details:**
- GET `/api/articles` returns all articles ordered by `createdAt: 'desc'`
- Includes category and editor relations

**Changes Reflected:**
- Table updates after create/edit/delete operations
- Featured status immediately visible
- Delete requires confirmation dialog

---

### 3.2 Create Article
**Location:** `/app/admin/articles/new/page.tsx`  
**API:** `/app/api/articles/route.ts` (POST)

**Functionality:**
- Comprehensive article creation form with:
  - **Title** (required) - Auto-generates slug
  - **Slug** (required) - Auto-generated from title, can be edited
  - **Excerpt** (optional)
  - **Category** (required) - Dropdown from available categories
  - **Author/Editor** (required) - Dropdown from available editors
  - **Featured Image** - Image upload component
  - **Content** (required) - Rich text editor
  - **Publishing Options:**
    - Publish immediately checkbox
    - Schedule for later (datetime-local input)
  - **SEO Settings:**
    - Meta Title (optional, defaults to article title)
    - Meta Description (optional, defaults to excerpt)
    - Featured checkbox (sets as hero article, unsets others)

**How it works:**
1. Page loads, fetches categories and editors from APIs
2. Auto-generates slug from title (lowercase, replace non-alphanumeric with hyphens)
3. Form submission calls `/api/articles` POST
4. Backend validates required fields: title, slug, content, categoryId, editorId
5. Normalizes slug (lowercase, sanitize)
6. Checks for duplicate slug (409 conflict if exists)
7. Calculates read time (word count / 200 words per minute)
8. If featured=true, unsets all other featured articles
9. Handles scheduling: if `scheduledAt` provided, sets `published=false` and stores `scheduledAt`
10. Creates article in database
11. Redirects to articles list

**API Details:**
- POST `/api/articles` expects JSON body with article data
- Returns 201 with created article
- Returns 400 for missing required fields
- Returns 409 for duplicate slug

**Slug Generation:**
- Auto-generates from title: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
- User can manually edit slug

**Scheduling Logic:**
- If `scheduledAt` is provided and `published=true`, article is NOT published immediately
- `published` set to `false`, `scheduledAt` stored
- Scheduled articles need to be published via `/api/articles/scheduled/publish` endpoint

**Changes Reflected:**
- New article appears in articles list
- Featured article immediately shows as featured in list
- Dashboard statistics update
- If published, article appears on frontend

---

### 3.3 Edit Article
**Location:** `/app/admin/articles/[id]/page.tsx`  
**API:** `/app/api/articles/[id]/route.ts` (GET, PUT, DELETE)

**Functionality:**
- Loads existing article data into form
- Same form fields as create article
- Pre-fills all fields including scheduled date (formatted for datetime-local input)
- Supports:
  - Save as Draft
  - Publish/Schedule
  - Delete article

**How it works:**
1. Page loads, fetches article by ID from `/api/articles/[id]` GET
2. Also fetches categories and editors lists
3. Formats `scheduledAt` for datetime-local input: `new Date(article.scheduledAt).toISOString().slice(0, 16)`
4. Form pre-filled with article data
5. On save, calls PUT `/api/articles/[id]`
6. Backend validates:
   - Required fields present
   - Category exists (404 if not found)
   - Editor exists (404 if not found)
   - Article exists (404 if not found)
   - Slug uniqueness (if changed, checks against other articles)
7. Recalculates read time
8. If featured=true, unsets other featured articles (except current)
9. Updates article in database
10. Redirects to articles list

**Delete Functionality:**
- Delete button at top of edit page
- Confirmation dialog before deletion
- Calls DELETE `/api/articles/[id]`
- Removes article from database (cascade deletes comments)
- Redirects to articles list

**API Details:**
- GET `/api/articles/[id]` - Returns article with relations
- PUT `/api/articles/[id]` - Updates article, returns updated article
- DELETE `/api/articles/[id]` - Deletes article, returns success

**Changes Reflected:**
- Article updates immediately in list
- Featured status updates
- Published status changes reflected on frontend
- Deleted article removed from all views

---

### 3.4 Set Featured Article
**Location:** `/app/admin/articles/page.tsx` (Set Featured button)

**Functionality:**
- One-click feature to set an article as featured
- When clicked, makes PUT request to update article with `featured: true`
- Automatically unsets all other featured articles

**How it works:**
1. User clicks "Set Featured" button in articles list
2. Calls `setFeatured(article.id)`
3. Fetches current article data
4. Makes PUT request with all article data plus `featured: true`
5. Backend unsets other featured articles before setting this one
6. Refreshes articles list

**Backend Logic:**
- Before setting featured, runs: `prisma.article.updateMany({ data: { featured: false }, where: { featured: true, NOT: { id } } })`
- Ensures only one featured article at a time

**Changes Reflected:**
- Featured badge appears immediately
- Other articles lose featured status
- Featured article appears as hero on homepage

---

## 4. Categories Management

### 4.1 Categories List & Create
**Location:** `/app/admin/categories/page.tsx`  
**API:** `/app/api/categories/route.ts` (GET, POST, DELETE)

**Functionality:**
- Two-column layout:
  - Left: Create category form
  - Right: List of all categories
- Form fields:
  - **Name** (required) - Auto-generates slug
  - **Slug** (required) - Auto-generated, can be edited
  - **Description** (optional)
- Each category card shows:
  - Name
  - Slug
  - Description (if present)
  - Delete button

**How it works:**
1. Page loads, fetches categories from `/api/categories` GET
2. Auto-generates slug from name (same logic as articles)
3. Form submission posts to `/api/categories` POST
4. Backend creates category in database
5. Form resets, categories list refreshes
6. Delete button requires confirmation, then calls DELETE `/api/categories?id={id}`

**API Details:**
- GET `/api/categories` - Returns all categories ordered by name
- POST `/api/categories` - Creates category, returns created category
- DELETE `/api/categories?id={id}` - Deletes category

**Slug Generation:**
- Same as articles: lowercase, replace non-alphanumeric with hyphens

**Validation:**
- Name and slug are required
- No duplicate name/slug validation visible (database unique constraint)

**Changes Reflected:**
- New category immediately appears in list
- Available in article creation/editing dropdowns
- Deleted category removed from list
- **Note:** Deleting category with articles might cause issues (cascade delete)

---

## 5. Editors/Authors Management

### 5.1 Editors List & Create
**Location:** `/app/admin/editors/page.tsx`  
**API:** `/app/api/editors/route.ts` (GET, POST, DELETE)

**Functionality:**
- Two-column layout:
  - Left: Create editor form
  - Right: List of all editors
- Form fields:
  - **Name** (required)
  - **Email** (required, unique)
  - **Bio** (optional)
  - **Avatar** (optional) - Image upload component
- Each editor card shows:
  - Name
  - Email
  - Bio (if present)
  - Delete button

**How it works:**
1. Page loads, fetches editors from `/api/editors` GET
2. Form submission posts to `/api/editors` POST
3. Backend generates slug from name (with uniqueness check)
4. Slug uniqueness: if slug exists, appends `-1`, `-2`, etc.
5. Creates editor in database
6. Form resets, editors list refreshes
7. Delete removes editor from list

**API Details:**
- GET `/api/editors` - Returns all editors ordered by name
- POST `/api/editors` - Creates editor with auto-generated unique slug
- DELETE `/api/editors?id={id}` - Deletes editor

**Slug Generation:**
- Generates from name: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
- Ensures uniqueness by checking database and appending counter if needed

**Changes Reflected:**
- New editor immediately appears in list
- Available in article creation/editing author dropdowns
- Deleted editor removed from list
- **Note:** Deleting editor with articles might cause issues (cascade delete)

---

## 6. Import Functionality

### 6.1 WordPress CSV Import
**Location:** `/app/admin/import/page.tsx`  
**API:** `/app/api/import/wordpress/route.ts`

**Functionality:**
- Upload CSV file exported from WordPress
- Automatically maps WordPress CSV columns to database schema
- Supports:
  - Required: Title, Content
  - Optional: Excerpt, Slug, Date, Status, Categories, Image URL, Author fields, Meta fields
- Creates categories and editors automatically if they don't exist
- Updates existing articles if slug matches
- Shows import results: success count, failed count, error messages

**How it works:**
1. User selects CSV file (accepts `.csv` files)
2. File uploaded via FormData to `/api/import/wordpress` POST
3. Backend parses CSV
4. For each row:
   - Maps WordPress columns to article fields
   - Creates/finds category by name
   - Creates/finds editor by email or name
   - Checks if article with slug exists (update vs create)
   - Creates or updates article
5. Returns results with success/failed counts and errors
6. Results displayed in UI

**CSV Column Mapping:**
- Title → title
- Content → content
- Excerpt → excerpt
- Slug → slug
- Date → publishedAt
- Status → published (Publish = true, Draft = false)
- Categories → creates/finds category
- Image URL → featuredImage
- Author Email/Name → creates/finds editor
- Meta Title → metaTitle
- Meta Description → metaDescription

**Category/Editor Creation:**
- Categories: Creates if name doesn't exist, generates slug
- Editors: Prioritizes email match, then name match, creates if neither found

**Article Update Logic:**
- If article with same slug exists, updates it instead of creating duplicate

**Changes Reflected:**
- Imported articles appear in articles list
- New categories/editors appear in their respective lists
- Dashboard statistics update
- Import results shown immediately

---

## 7. Subscribers Management

### 7.1 Subscribers List
**Location:** `/app/admin/subscribers/page.tsx`  
**API:** `/app/api/subscribers/export/route.ts` (CSV export)

**Functionality:**
- Displays all subscribers in a table
- Shows: Email, Subscribed At (formatted date)
- Export CSV button to download subscriber list
- Server-side rendered (not client-side)

**How it works:**
1. Page server-side renders, fetches all subscribers
2. Orders by `createdAt: 'desc'`
3. Displays in table format
4. Export button links to `/api/subscribers/export` which returns CSV file

**Export Functionality:**
- CSV download with headers: Email, Subscribed At
- Server-side route generates CSV from database

**Changes Reflected:**
- New subscribers appear immediately (if page refreshed)
- Export includes all current subscribers

---

## 8. Sponsored Banners Management

### 8.1 Sponsored Banners List & CRUD
**Location:** `/app/admin/sponsored-banners/page.tsx`  
**API:** `/app/api/sponsored-banners/route.ts` and `/app/api/sponsored-banners/[id]/route.ts`

**Functionality:**
- Create, edit, delete sponsored banners
- Banner types:
  - `homepage-main` - Horizontal banner for homepage
  - `homepage-side` - Vertical banner for homepage sidebar
  - `article-side` - Vertical banner for article pages sidebar
- Form fields:
  - **Title/Name** (required)
  - **Banner Image** (required) - Image upload or manual URL
  - **Click-through URL** (optional)
  - **Banner Type** (required) - Dropdown
  - **Active** (checkbox) - Defaults to true
  - **Start Date** (optional) - Date picker
  - **End Date** (optional) - Date picker
  - **Display Order** (number) - Lower numbers appear first

**How it works:**
1. Page loads, fetches all banners (including inactive) from `/api/sponsored-banners?active=false`
2. Click "Add Banner" shows form
3. Form submission:
   - POST `/api/sponsored-banners` for new banner
   - PUT `/api/sponsored-banners/[id]` for edit
4. Backend validates:
   - Required: title, imageUrl, type
   - Type must be one of: homepage-main, homepage-side, article-side
5. Creates/updates banner in database
6. Edit: Click edit icon, form pre-fills with banner data
7. Delete: Confirmation dialog, then DELETE request

**API Details:**
- GET `/api/sponsored-banners?type={type}&active={true|false}` - Filters by type and active status
- Active filtering considers date ranges: `startDate <= now AND (endDate >= now OR endDate is null)`
- POST `/api/sponsored-banners` - Creates banner
- PUT `/api/sponsored-banners/[id]` - Updates banner
- DELETE `/api/sponsored-banners/[id]` - Deletes banner

**Date Range Logic:**
- `startDate`: Banner becomes active on this date
- `endDate`: Banner becomes inactive after this date
- If dates not set, banner is always active (if active=true)

**Display Order:**
- Used to order multiple banners of same type
- Lower numbers appear first
- Defaults to 0

**Changes Reflected:**
- New banner appears in table immediately
- Edited banner updates in table
- Deleted banner removed from table
- Active banners appear on frontend based on type and date ranges

---

## 9. Settings Management

### 9.1 Site Settings
**Location:** `/app/admin/settings/page.tsx`  
**API:** `/app/api/settings/route.ts` (GET, PUT)

**Functionality:**
- Configure site-wide settings:
  - **Site Name** - Defaults to "AI Tech News"
  - **Logo** - Image upload or manual URL
  - **Subscribe CTA Text** - Text shown near subscribe form
  - **Nav Links JSON** - JSON array of navigation links
  - **Footer Links JSON** - JSON array of footer links
  - **Header Bar Settings:**
    - Left Side Text & Link URL
    - Right Side Text & Link URL

**How it works:**
1. Page loads, fetches settings from `/api/settings` GET
2. Backend uses singleton pattern: always uses `id: 'default'`
3. If settings don't exist, creates default record
4. Form fields pre-filled with current settings
5. On save, PUT `/api/settings` updates all fields
6. Page reloads after save to show updated logo

**API Details:**
- GET `/api/settings` - Returns settings (creates if doesn't exist)
- PUT `/api/settings` - Updates settings (singleton id='default')

**Settings Storage:**
- Stored in `Settings` table with `id: 'default'` (singleton)
- All fields are optional strings except `id`

**JSON Fields:**
- `navLinksJson`: `[{"label":"ENTERPRISE AI","href":"/category/enterprise-ai"}]`
- `footerLinksJson`: `[{"label":"Privacy","href":"/privacy"}]`
- Frontend parses these JSON strings to render navigation/footer

**Changes Reflected:**
- Logo updates immediately after page reload
- Site name updates in header
- Navigation/footer links update on frontend
- Header bar text/links update

---

## 10. Scheduled Publishing

### 10.1 Scheduled Articles
**Location:** `/app/api/articles/scheduled/publish/route.ts`

**Functionality:**
- Endpoint to publish articles that have reached their scheduled time
- Should be called periodically (via cron job)
- Finds articles where `scheduledAt <= now` and `published = false`
- Publishes them by setting `published = true`, `publishedAt = scheduledAt`, `scheduledAt = null`

**How it works:**
1. Cron job or scheduled task calls POST `/api/articles/scheduled/publish`
2. Backend queries for articles with:
   - `scheduledAt <= now`
   - `published = false`
3. Updates each article:
   - `published = true`
   - `publishedAt = scheduledAt` (or current date)
   - `scheduledAt = null`
4. Returns count of published articles

**API Details:**
- POST `/api/articles/scheduled/publish` - Publishes scheduled articles
- GET `/api/articles/scheduled/publish` - Returns list of articles ready to publish (for testing)

**Usage:**
- Should be called every few minutes via cron job
- Can be tested manually via GET endpoint

**Changes Reflected:**
- Scheduled articles automatically become published
- Appear on frontend at scheduled time
- Dashboard statistics update

---

## 11. Image Upload

### 11.1 Image Upload Component
**Location:** `components/admin/image-upload.tsx`

**Functionality:**
- Upload images via Supabase storage
- Used in: Article featured images, Editor avatars, Settings logo, Sponsored banners
- Uploads to Supabase bucket
- Returns public URL

**How it works:**
1. User selects image file
2. Component uploads to `/api/upload` endpoint
3. Backend uploads to Supabase storage
4. Returns public URL
5. URL stored in database field

**API:** `/app/api/upload/route.ts` - Handles file upload to Supabase

---

## 12. Navigation & UI

### 12.1 Admin Navigation
**Location:** `components/admin/admin-nav.tsx`

**Functionality:**
- Sidebar navigation with:
  - Dashboard
  - Articles
  - Categories
  - Editors
  - Import CSV
  - Subscribers
  - Sponsored Banners
  - Settings
  - Logout button
- Active route highlighting (bg-white text-black)
- Uses Next.js `usePathname()` to detect active route

**How it works:**
- Client component using `usePathname()` hook
- Compares current pathname with link href
- Applies active styles if pathname matches or starts with link href
- Logout button calls logout API and redirects

---

### 12.2 Breadcrumbs
**Location:** `components/admin/breadcrumbs.tsx`

**Functionality:**
- Shows breadcrumb navigation based on current route
- Displays path segments as links

---

## Data Flow Summary

### Create Flow (Articles Example):
1. User fills form → Client state
2. Submit → POST `/api/articles`
3. Backend validates → Prisma create
4. Database updated → Response with article
5. Frontend redirects → Articles list refreshes

### Update Flow:
1. User clicks edit → Load article data
2. Form pre-filled → User edits
3. Submit → PUT `/api/articles/[id]`
4. Backend validates → Prisma update
5. Database updated → Response
6. Frontend redirects → List shows updated data

### Delete Flow:
1. User clicks delete → Confirmation dialog
2. Confirm → DELETE `/api/articles/[id]`
3. Backend deletes → Prisma delete
4. Database updated → Success response
5. Frontend refreshes → Item removed from list

---

## Security Considerations

### Current Security Gaps:
1. **No Server-Side Auth Check**: Admin pages don't verify authentication server-side
2. **Client-Side Only**: Authentication relies on cookie, but pages don't check it
3. **API Routes**: Some API routes may not verify authentication (needs verification)

### Recommended Fixes:
1. Add `checkAdminAuth()` to admin layout or middleware
2. Protect API routes with authentication checks
3. Add redirect to login if not authenticated

---

## Database Schema Relationships

- **Article** → Category (many-to-one)
- **Article** → Editor (many-to-one)
- **Article** → Comments (one-to-many, cascade delete)
- **Category** → Articles (one-to-many, cascade delete)
- **Editor** → Articles (one-to-many, cascade delete)

**Cascade Deletes:**
- Deleting category deletes all its articles
- Deleting editor deletes all their articles
- Deleting article deletes all its comments

---

## Error Handling

### Client-Side:
- Alert dialogs for errors
- Try-catch blocks around API calls
- Loading states during operations

### Server-Side:
- HTTP status codes (400, 404, 409, 500)
- JSON error responses
- Console error logging

---

## Performance Considerations

- Dashboard uses `Promise.all()` for parallel queries
- Categories API has caching headers (300s)
- Client-side fetching for articles list (could be server-side rendered)
- Subscribers page is server-side rendered

---

This documentation covers all admin panel functionalities, their implementation details, data flow, and how changes are reflected throughout the system.

