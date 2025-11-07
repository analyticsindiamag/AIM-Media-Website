# Editor/Author Page Design Updates

## Changes Made to Match WSJ Reference Design

### 1. **Header Section (Profile Area)**

#### Name & Follow Button
- **Before**: Name and button stacked vertically
- **After**: Name and "Follow" button on same line (inline-flex)
- Font size: 40px mobile, 48px desktop
- Follow button: 11px text, bordered, hover effect

```tsx
<div className="flex items-center justify-center gap-3 mb-3">
  <h1 className="font-serif font-bold text-[40px] md:text-[48px]">
    {editor.name}
  </h1>
  <button className="inline-flex items-center px-3 py-1 border...">
    Follow
  </button>
</div>
```

#### Title/Role
- **Color**: Changed to gray (#666666) - `text-[var(--wsj-text-medium-gray)]`
- **Size**: 15px
- **Spacing**: Increased bottom margin to 24px (mb-6)

#### Social Icons
- **Size**: Reduced from 20px to 18px for more refined look
- **Spacing**: Reduced gap from 20px to 16px
- **Bottom margin**: Increased to 32px (mb-8)

#### Biography
- **Color**: Changed from black to gray (#666666) - `text-[var(--wsj-text-medium-gray)]`
- **Line height**: Set to 1.6 for better readability
- **Max width**: 680px centered for optimal reading
- **Paragraph spacing**: 20px between paragraphs (mb-5)
- **Alignment**: Left-aligned within centered container

### 2. **Latest Articles Section**

#### Section Header
- **Text**: "LATEST ARTICLES"
- **Size**: 13px (was 14px)
- **Letter spacing**: 0.08em (wider tracking)
- **Border**: Top border instead of thick divider
- **Color**: Black instead of gray
- **Padding**: 24px top padding

#### Article Cards

**Layout**:
- Horizontal layout: Image left, content right
- Image: 260px × 145px (was 280px × 160px)
- Gap: 20px between image and content

**Typography**:
- Category tag: 11px, uppercase, 0.08em letter spacing, gray
- Title: 24px serif, 1.25 line height, bold (increased from 22px)
- Excerpt: 15px sans-serif, gray color (was dark-gray), 1.5 line height
- Byline: 13px, gray

**Spacing**:
- Vertical padding: 24px each article (py-6)
- No extra space between articles (space-y-0)
- Border bottom between articles

**Byline Format**:
```
By [Author Name] and [Date]
```
Instead of:
```
By [Author Name] • [Date]
```

### 3. **Color Consistency**

All text colors now match WSJ spec:
- **Headings**: `--wsj-text-black` (#111111)
- **Body/bio text**: `--wsj-text-medium-gray` (#666666)
- **Meta/category**: `--wsj-text-medium-gray` (#666666)
- **Excerpts**: `--wsj-text-medium-gray` (#666666)

### 4. **Spacing Improvements**

- More breathing room around elements
- Consistent vertical rhythm
- Better paragraph spacing in bio
- Tighter article list (no extra space-y)

## Seed Data

✅ All styling is already in seed data:
- Editor bios with proper formatting (multi-paragraph)
- Titles: "Senior Reporter, AIM MEDIA HOUSE"
- Social media links (Twitter, LinkedIn)
- Avatar/profile images

## Files Modified

1. **`app/editor/[slug]/page.tsx`** - Main editor page component
   - Updated header layout (inline name + button)
   - Changed typography and spacing
   - Updated article card styling
   - Improved color consistency

2. **Cache Settings**:
   - `revalidate = 0` for development (instant updates)
   - Change back to `revalidate = 60` for production

## CSS Classes

The following utility classes are being used (inline Tailwind):
- No dependency on `.wsj-editor-*` classes
- All styling is inline for better maintainability
- Responsive breakpoints: mobile first, md:desktop

## Testing

✅ Seed data updated and applied
✅ Development server restarted with no caching
✅ Pages loading correctly
✅ Typography matches reference design
✅ Spacing matches reference design
✅ Colors match reference design

## Design Specifications

### Typography Scale
- Name: 40px (mobile) → 48px (desktop)
- Follow button: 11px
- Title/Role: 15px
- Bio: 15px (line-height: 1.6)
- Section heading: 13px uppercase
- Article category: 11px uppercase
- Article title: 24px
- Article excerpt: 15px
- Article byline: 13px

### Colors
- Primary text (headings): #111111
- Secondary text (bio, excerpts): #666666
- Borders: #E5E5E5
- Links: Black with hover underline

### Spacing
- Section padding: 24px top
- Article cards: 24px vertical padding each
- Bio paragraph spacing: 20px
- Element gaps: 12-20px depending on context

## Before Production Deploy

- [ ] Change `revalidate = 0` back to `revalidate = 60` in:
  - `app/editor/[slug]/page.tsx`
  - `app/category/[slug]/page.tsx`
- [ ] Test with production build
- [ ] Verify caching works correctly
- [ ] Check mobile responsiveness

---
**Updated**: November 7, 2025
**Reference**: WSJ Author Page Design

