# Manual Testing Guide - All Features

## Pre-requisites
1. Server running: `npm run dev`
2. Admin password set in `.env` as `ADMIN_PASSWORD`
3. Database seeded: `npm run seed`

## Test Checklist

### ✅ 1. Article Scheduling
**Steps:**
1. Go to `/admin/articles/new`
2. Fill in article details
3. Set `scheduledAt` to a future date/time
4. Uncheck "Published"
5. Submit
6. Verify article appears in admin list
7. Check `/api/articles/scheduled/publish` endpoint shows the scheduled article
8. Manually call POST `/api/articles/scheduled/publish` to publish it

**Expected Result:** Article is created as draft, scheduled for future, and can be published via API

---

### ✅ 2. Social Media Share Buttons
**Steps:**
1. Navigate to any published article (`/article/[slug]`)
2. Locate share buttons (top of article or hero overlay)
3. Click "X" - should open Twitter share dialog
4. Click "LinkedIn" - should open LinkedIn share dialog
5. Click "Facebook" - should open Facebook share dialog
6. Click "Copy link" - should copy URL to clipboard

**Expected Result:** All share buttons work correctly

---

### ✅ 3. Category Banner Image - Admin Edit
**Steps:**
1. Go to `/admin/categories`
2. Click "Edit" on any category
3. Upload or enter banner image URL
4. Click "Update"
5. Navigate to `/category/[slug]` for that category
6. Verify banner image displays prominently

**Expected Result:** Banner image appears on category page after editing

---

### ✅ 4. Category Banner Image - Display
**Steps:**
1. Navigate to `/category/[slug]` for any category
2. Verify banner image displays at top (if set)
3. Check responsive behavior (mobile/tablet/desktop)

**Expected Result:** Banner image displays correctly on all screen sizes

---

### ✅ 5. Editor Edit Functionality
**Steps:**
1. Go to `/admin/editors`
2. Click "Edit" on any editor
3. Form should switch to "Edit Editor" mode
4. Update name, email, bio, or avatar
5. Click "Update Editor"
6. Verify changes saved
7. Navigate to `/editor/[slug]` to see updated info

**Expected Result:** Editor details can be edited and changes reflect on editor page

---

### ✅ 6. Sponsored Banners CRUD
**Steps:**
1. Go to `/admin/sponsored-banners`
2. Click "Add Banner"
3. Fill in:
   - Title: "Test Banner"
   - Image URL: Valid image URL
   - Link URL: Optional
   - Type: Select one (homepage-main, homepage-side, article-side)
   - Active: Checked
   - Display Order: 1
4. Click "Create Banner"
5. Verify banner appears in list
6. Click "Edit" on the banner
7. Update title to "Updated Test Banner"
8. Click "Update Banner"
9. Verify update
10. Click "Delete" and confirm
11. Verify banner removed

**Expected Result:** Full CRUD operations work correctly

---

### ✅ 7. Sponsored Banners Display
**Steps:**
1. Create active banner (type: homepage-main)
2. Go to homepage (`/`)
3. Verify banner displays
4. Create active banner (type: article-side)
5. Go to any article page
6. Verify banner displays in sidebar

**Expected Result:** Banners display correctly based on type and active status

---

### ✅ 8. Responsive Design - Mobile
**Steps:**
1. Open browser DevTools
2. Set viewport to mobile (375x667)
3. Test:
   - Homepage (`/`)
   - Article page (`/article/[slug]`)
   - Category page (`/category/[slug]`)
   - Editor page (`/editor/[slug]`)
4. Verify:
   - Content is readable
   - No horizontal scroll
   - Navigation works
   - Buttons are tappable
   - Images scale correctly

**Expected Result:** All pages work well on mobile

---

### ✅ 9. Responsive Design - Tablet
**Steps:**
1. Set viewport to tablet (768x1024)
2. Test all pages
3. Verify layout adapts properly

**Expected Result:** Tablet layout looks good

---

### ✅ 10. Responsive Design - Desktop
**Steps:**
1. Set viewport to desktop (1920x1080)
2. Test all pages
3. Verify full-width layout uses space well

**Expected Result:** Desktop layout optimized

---

### ⚠️ 11. Comments Functionality (To Be Built)
**Status:** Not yet implemented
**Planned:**
- Comments API endpoints
- Comments display component
- Comment submission form
- Comment approval workflow

---

### ⚠️ 12. Like Functionality (To Be Built)
**Status:** Not yet implemented
**Planned:**
- Add `likes` field to Article model
- Like button component
- Like API endpoint
- Like tracking

---

### ⚠️ 13. AI Recommendations (To Be Built)
**Status:** Not yet implemented
**Planned:**
- User reading history tracking
- Recommendations API
- Recommendations display component

---

## Quick Test Commands

```bash
# Start server
npm run dev

# Run automated tests
npm run test:e2e

# Check scheduled articles
curl http://localhost:3000/api/articles/scheduled/publish

# Check API endpoints
curl http://localhost:3000/api/articles
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/editors
curl http://localhost:3000/api/sponsored-banners
```

## Test Results Template

| Feature | Status | Notes |
|---------|--------|-------|
| Article Scheduling | ⏳ | |
| Social Media Share | ⏳ | |
| Category Banner Edit | ⏳ | |
| Category Banner Display | ⏳ | |
| Editor Edit | ⏳ | |
| Sponsored Banners CRUD | ⏳ | |
| Sponsored Banners Display | ⏳ | |
| Responsive Mobile | ⏳ | |
| Responsive Tablet | ⏳ | |
| Responsive Desktop | ⏳ | |
| Comments | ❌ | Not implemented |
| Like | ❌ | Not implemented |
| AI Recommendations | ❌ | Not implemented |

