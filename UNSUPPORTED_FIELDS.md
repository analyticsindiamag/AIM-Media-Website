# WordPress CSV Import - Unsupported Fields

This document lists all WordPress CSV fields that are **NOT currently supported** in our import system.

## Summary

Based on the WordPress CSV structure provided, here are the fields that are **NOT imported**:

## ❌ Unsupported Fields

### 1. WordPress-Specific Fields

| Field Name | Description | Why Not Supported |
|------------|-------------|-------------------|
| `ID` | WordPress post ID | We use our own auto-generated IDs (CUID) |
| `Post Type` | WordPress post type (post, page, etc.) | WordPress-specific, not needed |
| `Permalink` | WordPress permalink URL | We generate our own URLs based on slug |
| `Format` | WordPress post format (standard, aside, etc.) | WordPress-specific feature |
| `Template` | WordPress template assignment | WordPress-specific feature |
| `Parent` | Hierarchical post parent ID | We don't support hierarchical posts |
| `Parent Slug` | Hierarchical post parent slug | We don't support hierarchical posts |
| `Order` | Custom ordering value | We use `publishedAt` date for ordering |
| `Comment Status` | WordPress comment settings (open/closed) | We handle comments differently |
| `Ping Status` | WordPress pingback/trackback settings | WordPress-specific feature |

### 2. WordPress-Specific Image Fields

| Field Name | Description | Why Not Supported |
|------------|-------------|-------------------|
| `Image Featured` | WordPress flag for featured image | Not needed - we use `featuredImage` URL field |
| `Attachment URL` | WordPress attachment URL | Not used in our article model |

**Note:** The following image metadata fields **ARE NOW SUPPORTED**:
- ✅ `Image Title` → `featuredImageTitle`
- ✅ `Image Caption` → `featuredImageCaption`
- ✅ `Image Description` → `featuredImageDescription`
- ✅ `Image Alt Text` → `featuredImageAltText`

### 3. Tags

| Field Name | Description | Why Not Supported |
|------------|-------------|-------------------|
| `Tags` | WordPress tags (comma-separated) | **Our system does not support tags**. Only categories are supported. Adding tags would require: |
| | | 1. New `Tag` model in schema |
| | | 2. Many-to-many relationship table (`ArticleTag`) |
| | | 3. Tag management UI in admin panel |
| | | 4. Tag filtering/search functionality |

### 4. Author Metadata

| Field Name | Description | Why Not Supported |
|------------|-------------|-------------------|
| `Author ID` | WordPress user ID | We match editors by email (primary) or name, not WordPress IDs |

**Note:** The following author fields **ARE SUPPORTED**:
- ✅ `Author First Name` → Combined into `editor.name`
- ✅ `Author Last Name` → Combined into `editor.name`
- ✅ `Author Username` → Used as fallback for `editor.name`
- ✅ `Author Email` → `editor.email` (used for matching)

### 5. Timestamps

| Field Name | Description | Why Not Supported |
|------------|-------------|-------------------|
| `Post Modified Date` | WordPress post modified timestamp | Prisma automatically manages `updatedAt` with `@updatedAt` decorator. Manual setting is not possible without changing the schema design. |

**Note:** The following date fields **ARE SUPPORTED**:
- ✅ `Date` / `Post Date` → `article.publishedAt` (used for publication date)

## Fields That ARE Supported

For reference, here are all the fields that **ARE imported**:

### ✅ Core Article Fields
- Title
- Content
- Excerpt
- Slug
- Date / Post Date → `publishedAt`
- Status → `published` (boolean)

### ✅ Category
- Categories → Creates category if doesn't exist

### ✅ Author/Editor
- Author First Name → Combined into `editor.name`
- Author Last Name → Combined into `editor.name`
- Author Username → Fallback for `editor.name`
- Author Email → `editor.email` (primary matching field)

### ✅ Image & Image Metadata
- Image URL → `featuredImage`
- Image Title → `featuredImageTitle` ⭐ NEW
- Image Caption → `featuredImageCaption` ⭐ NEW
- Image Description → `featuredImageDescription` ⭐ NEW
- Image Alt Text → `featuredImageAltText` ⭐ NEW

### ✅ SEO Fields
- Meta Title → `metaTitle`
- Meta Description → `metaDescription`

## Import Behavior Summary

### Editor Creation & Management
- ✅ **Automatically creates editors** if they don't exist
- ✅ **Matches editors** by email first, then by name
- ✅ **Generates unique emails** if conflicts occur
- ✅ **Editors can be edited** in admin panel (`/admin/editors`)
- ✅ Editors are reusable across multiple articles

### Post Date Handling
- ✅ **Uses CSV date** for `publishedAt` field
- ✅ **Displays date** on article pages (with author info)
- ✅ **Supports past dates** - articles with old dates will show the original publication date
- ✅ **Date formatting** shown as "MMM. d, yyyy h:mm a ET" on article pages

### Image Metadata for SEO
- ✅ **Image Alt Text** used in all `<img>` tags for accessibility and SEO
- ✅ **Image Caption** displayed below hero images
- ✅ **Image Title & Description** stored for future SEO enhancements
- ✅ **Open Graph images** use alt text in meta tags

## Total Field Count

- **Supported Fields**: 17 fields
- **Unsupported Fields**: 13 fields
- **Total WordPress CSV Fields**: ~30 fields

## Recommendations

If you need any unsupported fields, consider:

1. **Tags**: Would require significant schema and UI changes
2. **Permalink Redirects**: Could be stored in a separate redirect table for URL mapping
3. **Post Modified Date**: Not recommended to change - Prisma's auto-management is better
4. **Hierarchical Posts**: Would require parent-child relationship in schema

Most WordPress-specific fields (Post Type, Format, Template, etc.) are not needed in a standard blog/news site.

