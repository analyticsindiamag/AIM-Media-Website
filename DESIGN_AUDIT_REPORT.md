# Design Audit Report

## 1. Home Page

### ✅ Layout - PASSING
- **Multi-column grid**: ✅ Has 3-column layout (lg:col-span-4, lg:col-span-5, lg:col-span-3)
- **Hero section**: ✅ Center featured article with large image (aspect-[16/10] md:aspect-[16/9])
- **Sidebar**: ✅ "Most Popular" section in right column (desktop only)

### ❌ Typography & Spacing - ISSUES FOUND

| Element | Required | Current | Status |
|---------|----------|---------|--------|
| **Hero headline** | 2.5–3 rem (40–48px), bold 700 | 28-36px (`text-[28px] md:text-[32px] lg:text-[36px]`) | ❌ TOO SMALL |
| **Sub-headline** | 1.5 rem (24px), regular 500 | 17px (`--wsj-font-size-md`) | ❌ TOO SMALL |
| **Card title** | 1.375–1.5 rem (22–24px) | 22-24px | ✅ CORRECT |
| **Card summary** | 1rem (16px) | 17px (`--wsj-font-size-md`) | ❌ TOO LARGE |
| **Card spacing** | margin-bottom 32px, internal padding 16px | `space-y-8` (32px) | ✅ CORRECT |
| **Section headers** | 1.25 rem (20px), bold 600 | 21px (`--wsj-font-size-xl`) | ❌ TOO LARGE |

**Location**: `/app/page.tsx`
- Line 240: Hero title needs increase from 28-36px to 40-48px
- Line 244: Sub-headline needs increase from 17px to 24px
- Line 193: Card summary needs decrease from 17px to 16px
- Line 318: Section header needs decrease from 21px to 20px

### ✅ Unique Traits - PASSING
- ✅ Uses image overlays (`wsj-hero-overlay`)
- ✅ Category labels in uppercase

---

## 2. Article Page

### ❌ Layout - ISSUES FOUND

| Requirement | Current | Status |
|-------------|---------|--------|
| **Main column** | ~70% width | 75% (lg), 83% (xl) - `lg:col-span-9 xl:col-span-10` | ❌ TOO WIDE |
| **Sidebar** | ~30% width | 25% (lg), 17% (xl) - `lg:col-span-3 xl:col-span-2` | ❌ TOO NARROW |
| **Content order** | Header → Headline → Byline → Hero → Body | Hero comes first | ⚠️ DIFFERENT |

**Location**: `/app/article/[slug]/page.tsx`
- Line 265: Grid columns should be `lg:col-span-8` (66%) instead of `lg:col-span-9` (75%)
- Line 402: Sidebar should be `lg:col-span-4` (33%) instead of `lg:col-span-3` (25%)

### ❌ Typography & Spacing - ISSUES FOUND

| Element | Required | Current | Status |
|---------|----------|---------|--------|
| **Headline** | 2.25–2.5 rem (36–40px), bold 700 | 42-48px (`--wsj-font-size-6xl/7xl`) | ❌ TOO LARGE |
| **Byline/date** | 0.875–1rem (14–16px), grey #666 | 13px (`--wsj-font-size-sm`) | ❌ TOO SMALL |
| **Paragraph spacing** | 1.25em (20px) | 24px (`--wsj-spacing-lg`) | ❌ TOO LARGE |
| **H2 sub-headings** | 1.5 rem (24px) | 28px (`--wsj-font-size-3xl`) | ❌ TOO LARGE |
| **H2 top margin** | 40px | 32px (`--wsj-spacing-xl`) | ❌ TOO SMALL |
| **H2 bottom margin** | 16px | 16px (`--wsj-spacing-md`) | ✅ CORRECT |
| **Blockquote border** | 3px #DDD | 4px | ❌ TOO THICK |
| **Blockquote padding** | 16px | 24px (`--wsj-spacing-lg`) | ❌ TOO LARGE |
| **Blockquote font size** | 1.25 rem (20px) | 16px (base) | ❌ TOO SMALL |

**Location**: `/app/globals.css`
- Line 286-287: Title font size needs adjustment
- Line 331-344: Byline needs 14-16px instead of 13px  
- Line 479-484: Paragraph margin-bottom should be 20px not 24px
- Line 486-493: H2 should be 24px not 28px, top margin 40px not 32px
- Line 532-540: Blockquote border 3px, padding 16px, font-size 20px

### ⚠️ Unique Traits - PARTIAL

| Feature | Status |
|---------|--------|
| Sidebar for related links or ads | ✅ Present |
| Drop cap for first paragraph | ❌ Missing |
| Wide hero image with 24px vertical margin | ✅ Present |

---

## 3. Author / Editor Page

### ✅ Layout - PASSING
- ✅ Top section: profile photo + bio (left), "Follow" button (right)
- ✅ Below: list of authored articles

### ❌ Typography & Spacing - ISSUES FOUND

| Element | Required | Current | Status |
|---------|----------|---------|--------|
| **Name** | 1.75–2 rem (28–32px), bold | 36px (`--wsj-font-size-5xl`) | ❌ TOO LARGE |
| **Bio** | 1rem (16px), line-height 1.5 | 17px (`--wsj-font-size-md`), lh 1.5 | ❌ SIZE TOO LARGE |
| **Article title** | 1.25 rem (20px) | 24-28px (`--wsj-font-size-2xl/3xl`) | ❌ TOO LARGE |
| **Article summary** | 0.875 rem (14px) | 17px (`--wsj-font-size-md`) | ❌ TOO LARGE |
| **List item spacing** | 24px vertical | 32px (`space-y-8`) | ❌ TOO LARGE |

**Location**: `/app/editor/[slug]/page.tsx`
- Line 151: Name should be 28-32px not 36px
- Line 188-191: Bio should be 16px not 17px
- Line 236: Article title should be 20px not 24-28px
- Line 244: Summary should be 14px not 17px
- Line 204: Change `space-y-8` to `space-y-6` (24px)

**Location**: `/app/globals.css`
- Line 746-752: `wsj-editor-name` should be 28-32px
- Line 762-767: `wsj-editor-bio` should be 16px

### ✅ Unique Traits - PASSING
- ✅ Profile section separated by border
- ✅ Emphasis on author identity with circular avatar

---

## 4. Category / Section Page

### ❌ Layout - ISSUES FOUND

| Requirement | Current | Status |
|-------------|---------|--------|
| **Secondary nav (tabs)** | Required for subsections | Not present | ❌ MISSING |
| **Hero area** | Featured story (large image + title) | Only banner image, no featured story | ⚠️ PARTIAL |
| **Article grid** | 2–3 column grid | Single column list | ❌ MISSING |
| **Right sidebar** | Optional top stories | Not present | ⚠️ OPTIONAL |

**Location**: `/app/category/[slug]/page.tsx`
- Missing tab navigation for subsections
- Line 187-264: Should use grid layout (2-3 columns) instead of single column list

### ❌ Typography & Spacing - ISSUES FOUND

| Element | Required | Current | Status |
|---------|----------|---------|--------|
| **Section title** | 2 rem (32px), bold 600 | 36-42px (`--wsj-font-size-5xl/6xl`) | ❌ TOO LARGE |
| **Card headline** | 1.375 rem (22px), bold 600 | 24-28px (`--wsj-font-size-2xl/3xl`) | ❌ TOO LARGE |
| **Summary** | 0.9375 rem (15px) | 17px (`--wsj-font-size-md`) | ❌ TOO LARGE |
| **Grid gutter** | 24–32px | 32px but no grid | ⚠️ SIZE OK, LAYOUT WRONG |
| **Section padding** | 40px top/bottom | 32-48px (`py-8 md:py-12`) | ✅ CLOSE ENOUGH |

**Location**: `/app/category/[slug]/page.tsx`
- Line 169: Section title should be 32px not 36-42px
- Line 215: Card headline should be 22px not 24-28px
- Line 223: Summary should be 15px not 17px
- Need to implement 2-3 column grid layout

### ❌ Unique Traits - ISSUES FOUND

| Feature | Status |
|---------|--------|
| Section nav with accent underline for active tab | ❌ Missing |
| Consistent card rhythm for visual scanning | ✅ Present in list format |

---

## Summary of Issues

### Critical Issues (Layout)
1. ❌ **Article Page**: Column ratio wrong (current 75/25%, should be 70/30%)
2. ❌ **Category Page**: Missing 2-3 column grid layout (currently single column)
3. ❌ **Category Page**: Missing secondary tab navigation

### High Priority (Typography)
4. ❌ **Home Page Hero**: Headline too small (28-36px → 40-48px)
5. ❌ **Home Page Hero**: Sub-headline too small (17px → 24px)
6. ❌ **Article Page**: H2 wrong size (28px → 24px)
7. ❌ **Article Page**: Headline too large (42-48px → 36-40px)
8. ❌ **Category Page**: Section title too large (36-42px → 32px)
9. ❌ **Editor Page**: Name too large (36px → 28-32px)

### Medium Priority (Spacing & Details)
10. ❌ **Article Content**: Paragraph spacing wrong (24px → 20px)
11. ❌ **Article Content**: H2 top margin wrong (32px → 40px)
12. ❌ **Article Content**: Blockquote border wrong (4px → 3px)
13. ❌ **Article Content**: Blockquote padding wrong (24px → 16px)
14. ❌ **Article Content**: Blockquote font size wrong (16px → 20px)
15. ❌ **Editor Page**: Article list spacing wrong (32px → 24px)

### Low Priority (Nice to Have)
16. ⚠️ **Article Page**: Missing drop cap on first paragraph
17. ❌ **CSS Variables**: `--wsj-font-size-md` is 17px but should be 16px for body text

---

## Recommendations

### Immediate Fixes
1. Update CSS variables in `globals.css` to match specifications
2. Fix home page hero typography
3. Fix article page column widths
4. Implement category page grid layout

### Phase 2
5. Add drop cap styling for article first paragraph
6. Add secondary navigation tabs to category pages
7. Fine-tune all spacing values to exact specifications

