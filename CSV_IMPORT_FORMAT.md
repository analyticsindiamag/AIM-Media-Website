# CSV Import Format Documentation

This document describes the CSV format required for importing articles into the database.

## CSV Format

The CSV file should have the following columns (headers are case-insensitive):

### Required Columns

- **title** (or `post_title`): Article title
- **content** (or `post_content`): Article content (HTML supported)

### Optional Columns

- **excerpt** (or `post_excerpt`): Article excerpt/summary
- **slug**: Custom URL slug (auto-generated from title if not provided)
- **category** (or `categories`): Category name (creates category if it doesn't exist). If multiple categories are provided (separated by `;`, `,`, or `|`), only the first one is used.
- **author first name**: Author's first name
- **author last name**: Author's last name
- **author email**: Author's email address (used for editor matching)
- **author username** (or `post_author`): Author's username
- **status**: Publication status (`publish` or `draft`, defaults to `publish`)
- **date** (or `post_date`): Publication date (ISO format: YYYY-MM-DD)
- **featured_image_url** (or `image url`, `imageurl`): URL to featured image
- **meta_title**: SEO meta title
- **meta_description**: SEO meta description

## How It Works

### Category Handling
- Categories are automatically created if they don't exist
- Category slug is auto-generated from the category name
- If no category is provided, "General" is used as default

### Editor/Author Handling
- Editors are matched first by email (if provided), then by name
- If no matching editor is found, a new editor is created
- Editor email is required - if not provided, it's auto-generated from username or defaults to `admin@example.com`
- If email conflicts occur, a unique email is generated

### Article Updates
- If an article with the same slug already exists, it will be **updated** (not duplicated)
- When updating, the category and editor references are validated and updated
- If the slug doesn't exist, a new article is created
- Slug uniqueness is automatically handled (appends numbers if needed)

## Example CSV

```csv
title,content,excerpt,slug,category,author first name,author last name,author email,author username,status,date,featured_image_url
"Getting Started with Next.js","<p>Content here...</p>","Learn Next.js basics","getting-started-nextjs","Technology","John","Doe","john@example.com","johndoe","publish","2024-01-15","https://example.com/image.jpg"
```

## Notes

1. **Delimiter**: Supports both comma (`,`) and tab (`\t`) delimiters
2. **Quotes**: Fields containing commas or special characters should be quoted
3. **Encoding**: UTF-8 encoding is recommended
4. **HTML Content**: The `content` field supports HTML formatting
5. **Date Format**: Use ISO format (YYYY-MM-DD) for dates
6. **Multiple Categories**: Only the first category is used if multiple are provided

## Error Handling

- Missing required fields (title, content) will cause the row to fail
- Category and editor creation failures are handled gracefully
- Import results show success/failure counts and error messages

## Update vs Create

- **Update**: When a slug matches an existing article, the article is updated
- **Create**: When a slug doesn't exist, a new article is created
- Both operations ensure category and editor exist before proceeding

