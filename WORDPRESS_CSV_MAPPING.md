# WordPress CSV Import - Field Mapping Documentation

This document outlines how WordPress CSV export fields are mapped to our database schema.

## Supported Fields (Mapped to Database)

### ✅ Core Article Fields

| WordPress CSV Column | Database Field | Notes |
|----------------------|---------------|-------|
| `Title` | `article.title` | Required field |
| `Content` | `article.content` | Required field, supports HTML |
| `Excerpt` | `article.excerpt` | Optional, article summary |
| `Slug` | `article.slug` | Auto-generated from title if not provided |
| `Date` / `Post Date` | `article.publishedAt` | Publication date |
| `Status` | `article.published` | Maps "publish" → true, others → false |
| `Permalink` | `article.slug` & `category.slug` | Preserves WordPress path by extracting the final segment (article slug) and penultimate segment (category slug) |

### ✅ Category Fields

| WordPress CSV Column | Database Field | Notes |
|----------------------|---------------|-------|
| `Categories` | `article.categoryId` | Creates category if doesn't exist. If multiple categories provided (separated by `;`, `,`, or `|`), only the first one is used |

### ✅ Author/Editor Fields

| WordPress CSV Column | Database Field | Notes |
|----------------------|---------------|-------|
| `Author First Name` | `editor.name` | Combined with last name |
| `Author Last Name` | `editor.name` | Combined with first name |
| `Author Username` | `editor.name` | Used as fallback if name not provided |
| `Author Email` | `editor.email` | Used for editor matching (primary) |

**Editor Matching Logic:**
1. First tries to match by email (if provided)
2. Then tries to match by name
3. Creates new editor if no match found
4. Ensures unique email (generates unique email if conflict)

### ✅ Image Fields

| WordPress CSV Column | Database Field | Notes |
|----------------------|---------------|-------|
| `Image URL` | `article.featuredImage` | Featured image URL. If multiple URLs separated by `|`, takes the first one |
| `Image Title` | `article.featuredImageTitle` | Image title for SEO (optional) |
| `Image Caption` | `article.featuredImageCaption` | Image caption displayed below image (optional) |
| `Image Description` | `article.featuredImageDescription` | Image description for SEO (optional) |
| `Image Alt Text` | `article.featuredImageAltText` | Image alt text for accessibility and SEO (optional) |

### ✅ SEO Fields

| WordPress CSV Column | Database Field | Notes |
|----------------------|---------------|-------|
| `Meta Title` | `article.metaTitle` | SEO meta title (optional) |
| `Meta Description` | `article.metaDescription` | SEO meta description (optional) |

## Fields NOT Supported (Ignored)

These WordPress CSV fields are present in the export but are **not imported** into our database:

### ❌ WordPress-Specific Fields

| WordPress CSV Column | Reason Not Supported |
|---------------------|---------------------|
| `ID` | WordPress post ID - not needed, we use our own IDs |
| `Post Type` | WordPress-specific field (post, page, etc.) |
| `Format` | WordPress post format (standard, aside, etc.) |
| `Template` | WordPress template assignment |
| `Parent` | Hierarchical post parent ID |
| `Parent Slug` | Hierarchical post parent slug |
| `Order` | Custom ordering (we use publishedAt for ordering) |
| `Comment Status` | WordPress comment settings (we handle comments differently) |
| `Ping Status` | WordPress pingback/trackback settings |

### ❌ WordPress-Specific Image Fields

| WordPress CSV Column | Reason Not Supported |
|---------------------|---------------------|
| `Image Featured` | WordPress-specific flag (not needed) |
| `Attachment URL` | Not used in our article model |

### ❌ Tags

| WordPress CSV Column | Reason Not Supported |
|---------------------|---------------------|
| `Tags` | **Our system does not currently support tags**. Only categories are supported. If you need tags, this would require schema changes. |

### ❌ Author Metadata

| WordPress CSV Column | Reason Not Supported |
|---------------------|---------------------|
| `Author ID` | We use email/name for matching, not WordPress user IDs |

### ❌ Timestamps

| WordPress CSV Column | Reason Not Supported |
|---------------------|---------------------|
| `Post Modified Date` | Prisma automatically manages `updatedAt` field with `@updatedAt` decorator, so manual setting is not possible |

## Import Behavior

### Category Handling
- Categories are automatically created if they don't exist
- Category slug is taken from the WordPress permalink when available; otherwise it is generated from the category name
- If no category is provided and permalink lacks a category, "General" is used as default
- If multiple categories are provided (separated by `;`, `,`, or `|`), only the first one is used

### Editor/Author Handling
- Editors are matched first by email (if provided), then by name
- If no matching editor is found, a new editor is created
- Editor email is required - if not provided, it's auto-generated from username or defaults to `admin@example.com`
- If email conflicts occur, a unique email is generated automatically

### Article Updates
- If an article with the same slug already exists, it will be **updated** (not duplicated)
- When updating, the category and editor references are validated and updated
- If the slug doesn't exist, a new article is created
- Slug uniqueness is automatically handled (appends numbers if needed)

### Date Handling
- Publication date (`Date` / `Post Date`) is used for `publishedAt`
- If date is invalid or missing, current date is used for published articles
- `updatedAt` is automatically managed by Prisma (cannot be manually set)

## CSV Format Requirements

1. **Delimiter**: Supports both comma (`,`) and tab (`\t`) delimiters
2. **Quotes**: Fields containing commas or special characters should be quoted
3. **Encoding**: UTF-8 encoding is recommended
4. **HTML Content**: The `content` field supports HTML formatting (WordPress Gutenberg blocks are preserved)
5. **Date Format**: Use ISO format (YYYY-MM-DD) for dates

## Recommendations for Future Enhancements

If you need any of the unsupported fields, consider:

1. **Tags Support**: Add a `Tag` model and `ArticleTag` relationship table
2. **Image Metadata**: Extend schema to store image title, caption, alt text
3. **Permalink Redirects**: Store WordPress permalinks for redirect mapping
4. **Post Modified Date**: Would require changing `updatedAt` from `@updatedAt` to regular DateTime field (not recommended)

## Permalink Handling

### WordPress Permalink Format
- WordPress uses the format: `/{category-slug}/{article-slug}`
- Example: `https://aimmediahouse.com/recognitions-lists/20-hottest-ai-startups-in-india-2022`
- The import route extracts both the category slug (penultimate segment) and the article slug (final segment) from the `Permalink` field
- If `Permalink` is not provided, it falls back to the `Slug` field or generates one from the title, and the category slug is derived from the category name

### URL Structure
- **Old format**: `/article/{slug}` (kept for backward compatibility)
- **New format**: `/{category-slug}/{article-slug}` (WordPress permalink format)
- All new articles and imported articles use the WordPress format
- All links throughout the application use the WordPress format

## Example WordPress CSV Structure

```
ID	Title	Content	Excerpt	Date	Permalink	Categories	Image URL	Status	Author Email	Author First Name	Author Last Name	Slug	Meta Title	Meta Description
862	"Article Title"	"<p>Content...</p>"	"Excerpt..."	2022-11-20	"https://aimmediahouse.com/recognitions-lists/20-hottest-ai-startups-in-india-2022"	"Recognitions & Lists"	"https://example.com/image.jpg"	publish	"author@example.com"	"John"	"Doe"	"20-hottest-ai-startups-in-india-2022"	"SEO Title"	"SEO Description"
```

**Note**: The `Permalink` field is used to extract the exact category + slug combination. The resulting URL will be: `/recognitions-lists/20-hottest-ai-startups-in-india-2022`

