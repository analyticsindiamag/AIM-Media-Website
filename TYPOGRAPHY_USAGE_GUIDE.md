# Typography Usage Guide

## Quick Reference for New Component Styles

This guide shows how to use the newly added typography components that align with the reference design system.

---

## Component Classes

### 1. Pull Quote / Blockquote

**Purpose**: Highlight key quotes or statements within articles  
**Specs**: 20px size, 1.4 line-height, 400 weight, italic

**Usage**:
```html
<div class="pull-quote">
  "This is a key quote that deserves special emphasis in the article layout."
  <cite>— John Doe, CEO</cite>
</div>
```

**Alternative class name**:
```html
<blockquote class="quote-callout">
  Important statement here
  <cite>Source attribution</cite>
</blockquote>
```

**Visual Result**:
- 20px italic serif text (Merriweather)
- Soft gray left border (4px, #DDDDDD)
- 24px left padding
- 40px top/bottom margin
- Citation in 14px gray text

---

### 2. Deck / Subheading

**Purpose**: Introductory paragraph or section subheading  
**Specs**: 20px size, 1.4 line-height, 500 weight

**Usage**:
```html
<p class="deck">
  This is the introductory paragraph that provides context before the main article begins.
</p>
```

**Alternative class names**:
```html
<p class="subheading">Section introduction</p>
<p class="article-deck">Article lead paragraph</p>
```

**Visual Result**:
- 20px medium weight serif text (Merriweather)
- Dark gray color (#333)
- 16px bottom margin
- Used for article intros and section headers

---

### 3. Byline / Meta Text

**Purpose**: Author attribution, timestamps, metadata  
**Specs**: 14px size, 1.4 line-height, 400 weight

**Usage**:
```html
<div class="byline">
  By Sara Patel | Nov 7, 2025 | 5 min read
</div>
```

**Alternative class names**:
```html
<span class="meta-text">Updated: Nov 7, 2025</span>
<div class="article-meta">Category: Technology</div>
```

**Visual Result**:
- 14px normal weight serif text (Merriweather)
- Medium gray color (#666)
- Used for authors, dates, categories, read times

---

## Typography Scale Reference

### Font Sizes

| Variable | Size | Use Case |
|----------|------|----------|
| `--wsj-font-size-xs` | 12px | Fine print, captions |
| `--wsj-font-size-sm` | 14px | Meta text, navigation, bylines |
| `--wsj-font-size-base` | 16px | Body text, paragraphs |
| `--wsj-font-size-md` | 18px | Larger body text |
| `--wsj-font-size-lg` | 20px | Decks, subheadings, pull quotes |
| `--wsj-font-size-xl` | 22px | Large emphasis text |
| `--wsj-font-size-2xl` | 24px | H3 headings |
| `--wsj-font-size-3xl` | 28px | H2 headings |
| `--wsj-font-size-6xl` | 42px | H1 headings (mobile) |
| `--wsj-font-size-7xl` | 48px | H1 headings (desktop) |
| `--wsj-font-size-quote` | 20px | Pull quotes specifically |

### Line Heights

| Variable | Value | Use Case |
|----------|-------|----------|
| `--wsj-line-height-tight` | 1.2 | Headings (H1-H3) |
| `--wsj-line-height-normal` | 1.25 | Compact text |
| `--wsj-line-height-relaxed` | 1.3 | Subheadings |
| `--wsj-line-height-deck` | 1.4 | Decks, quotes, meta |
| `--wsj-line-height-loose` | 1.5 | Body text, paragraphs |
| `--wsj-line-height-article` | 1.6 | Long-form comfortable reading |

### Font Weights

| Variable | Value | Use Case |
|----------|-------|----------|
| `--wsj-font-weight-light` | 300 | Light emphasis |
| `--wsj-font-weight-normal` | 400 | Body text, standard |
| `--wsj-font-weight-medium` | 500 | Subheadings, decks |
| `--wsj-font-weight-semibold` | 600 | Moderate emphasis |
| `--wsj-font-weight-bold` | 700 | Headlines, strong emphasis |

---

## Font Stack

### Display Font (Headlines)
```css
font-family: var(--wsj-font-serif);
/* Old Standard TT, EB Garamond, Georgia, Times, serif */
```

**Use for**: H1, H2, H3, article titles, section headings

### Body Font (Text)
```css
font-family: var(--wsj-font-sans);
/* Merriweather, Georgia, serif */
```

**Use for**: Paragraphs, body text, quotes, decks, meta text

**Note**: Despite the variable name `--font-sans`, this is actually a serif font per the reference specifications.

---

## Color Palette

### Text Colors

```css
--wsj-text-black: #111111;        /* Primary body text */
--wsj-text-dark-gray: #333333;    /* Secondary text, decks */
--wsj-text-medium-gray: #666666;  /* Meta text, bylines */
--wsj-text-light-gray: #999999;   /* Subtle text */
```

### Link Colors

```css
--wsj-blue-primary: #0050A4;      /* Links, accents */
--wsj-blue-hover: #003d82;        /* Link hover state */
```

### Background Colors

```css
--wsj-bg-white: #FFFFFF;          /* Page background */
--wsj-bg-light-gray: #F8F8F8;     /* Muted sections */
```

### Border Colors

```css
--wsj-border-light: #E5E5E5;      /* Standard borders */
--wsj-border-quote: #DDDDDD;      /* Quote borders */
```

---

## Spacing Scale

Based on 8px grid system:

```css
--wsj-spacing-xs: 0.25rem;   /* 4px */
--wsj-spacing-sm: 0.5rem;    /* 8px */
--wsj-spacing-md: 1rem;      /* 16px */
--wsj-spacing-lg: 1.5rem;    /* 24px */
--wsj-spacing-xl: 2rem;      /* 32px */
--wsj-spacing-2xl: 2.5rem;   /* 40px */
--wsj-spacing-3xl: 4rem;     /* 64px */
```

---

## Layout Containers

### Standard Container
```html
<div class="wsj-container">
  <!-- Content with 1200px max width, centered -->
</div>
```

**Specs**:
- Max width: 1200px
- Padding: 16px mobile, 24px desktop
- Centered with auto margins

### Article Container
```html
<div class="article-container">
  <!-- Optimized for reading, 850px max width -->
</div>
```

**Specs**:
- Max width: 850px (optimal for 60-75 characters per line)
- Padding: Same as wsj-container
- Used for article content

---

## Example Article Structure

```html
<article class="article-container">
  <!-- Title -->
  <h1>Breaking: AI Startup Raises $50M</h1>
  
  <!-- Deck / Lead -->
  <p class="deck">
    New funding will accelerate development of enterprise AI platform 
    and expand team across three cities.
  </p>
  
  <!-- Byline -->
  <div class="byline">
    By Sara Patel | Nov 7, 2025, 10:30 AM ET
  </div>
  
  <!-- Body Content -->
  <div class="article-content">
    <p>
      The startup, founded in 2023, announced today that it has closed 
      a $50 million Series B funding round...
    </p>
    
    <!-- Pull Quote -->
    <div class="pull-quote">
      "This funding validates our vision of making enterprise AI accessible 
      to mid-market companies."
      <cite>— Jennifer Lee, CEO</cite>
    </div>
    
    <p>
      The company plans to use the funds to expand its engineering team...
    </p>
    
    <!-- Section Subheading -->
    <h2>Market Impact</h2>
    
    <p>
      Industry analysts note that this represents a shift in AI investment 
      patterns...
    </p>
  </div>
</article>
```

---

## Responsive Considerations

### Mobile (< 768px)
- Font sizes remain the same (no scaling down)
- H1 uses 42px (--wsj-font-size-6xl)
- Side padding: 16px
- Line length: Naturally constrained by viewport

### Tablet (768-1023px)
- H1 scales to 48px (--wsj-font-size-7xl)
- Side padding: 24px
- Container: Full width with padding

### Desktop (1024px+)
- H1: 48px (--wsj-font-size-7xl)
- Side padding: 24px
- Container: Max 1200px, centered
- Article content: Max 850px for optimal line length

---

## Accessibility Guidelines

### Contrast Ratios
- Body text (#111): 15.77:1 (AAA)
- Medium gray (#666): 5.74:1 (AA Large)
- Link blue (#0050A4): 7.12:1 (AAA)

### Font Size Minimums
- Never go below 14px for readable text
- Meta text minimum: 14px
- Body text: 16px (1rem)

### Line Length
- Optimal: 60-75 characters
- Max: 85 characters
- Current article width (850px @ 16px): ~65-70 chars ✅

### Line Height
- Body text: 1.5 minimum (WCAG AA)
- Headings: 1.2-1.3 (tighter acceptable)

---

## Common Patterns

### Article Header with Deck
```html
<header>
  <h1>Main Article Title Here</h1>
  <p class="deck">
    Supporting paragraph that provides context and encourages reading.
  </p>
  <div class="byline">
    By Author Name | Date, Time
  </div>
</header>
```

### Quote with Attribution
```html
<blockquote class="pull-quote">
  "The key insight that changed our approach to solving this problem."
  <cite>— Expert Name, Title</cite>
</blockquote>
```

### Section Introduction
```html
<section>
  <h2>Section Title</h2>
  <p class="deck">
    Brief introduction to this section's content and why it matters.
  </p>
  <p>
    Regular body text continues here...
  </p>
</section>
```

### Metadata Block
```html
<div class="article-meta">
  <span>Updated: Nov 7, 2025</span>
  <span>•</span>
  <span>5 min read</span>
  <span>•</span>
  <span>Category: Technology</span>
</div>
```

---

## Migration Notes

### Replacing Old Styles

**Before** (generic blockquote):
```html
<blockquote>
  Quote text here
</blockquote>
```

**After** (emphasized pull quote):
```html
<div class="pull-quote">
  Quote text here
  <cite>— Source</cite>
</div>
```

**Before** (large intro paragraph):
```html
<p style="font-size: 18px; font-weight: 500;">
  Introduction text
</p>
```

**After** (semantic deck):
```html
<p class="deck">
  Introduction text
</p>
```

**Before** (inline byline):
```html
<p style="font-size: 13px; color: #999;">
  By Author | Date
</p>
```

**After** (semantic byline):
```html
<div class="byline">
  By Author | Date
</div>
```

---

## Performance Tips

1. **Font Loading**: Old Standard TT and Merriweather are loaded via Google Fonts with `display: swap`
2. **CSS Variables**: Applied dynamically from database, fallbacks in globals.css
3. **Layout Shift**: Font variables applied before render to prevent FOUT
4. **Caching**: Design system values cached via Prisma

---

## Design System Admin Panel

To update design system values without code changes:

1. Navigate to `/admin/settings`
2. Update design system JSON fields:
   - `designSystemColorsJson`
   - `designSystemTypographyJson`
   - `designSystemLayoutJson`
3. Save changes
4. Refresh any page to see updates

**Note**: Changes apply site-wide immediately without rebuild.

---

## Testing Checklist

When implementing new components:

- [ ] Check font family (Merriweather for body, Old Standard TT for display)
- [ ] Verify font size matches spec
- [ ] Confirm line height is appropriate
- [ ] Test color contrast (minimum 4.5:1 for body text)
- [ ] Validate spacing uses 8px grid
- [ ] Test on mobile, tablet, desktop
- [ ] Check dark mode appearance
- [ ] Verify accessibility (keyboard, screen reader)

---

## Support

For questions or issues with the typography system:
- Refer to `TYPOGRAPHY_AUDIT.md` for detailed analysis
- Check `TYPOGRAPHY_CHANGES_SUMMARY.md` for complete change log
- Review `lib/design-system.ts` for TypeScript interfaces
- See `prisma/seed.js` for default values

---

**Last Updated**: November 7, 2025  
**Design System Version**: 2.0 (Reference Compliant)

