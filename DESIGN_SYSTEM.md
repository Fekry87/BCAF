# Design System Specification

## Overview
A calm, credible, academic design system inspired by Queen Mary University of London's approach to typography, hierarchy, and visual structure.

---

## Typography

### Font Stack
- **Primary (Headings):** "Source Serif 4", Georgia, "Times New Roman", serif
- **Secondary (Body):** "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Type Scale (Desktop)
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-display` | 3.5rem (56px) | 1.1 | 600 | Hero headlines |
| `--text-h1` | 2.5rem (40px) | 1.2 | 600 | Page titles |
| `--text-h2` | 2rem (32px) | 1.25 | 600 | Section headers |
| `--text-h3` | 1.5rem (24px) | 1.3 | 600 | Card titles |
| `--text-h4` | 1.25rem (20px) | 1.4 | 600 | Subsection titles |
| `--text-body-lg` | 1.125rem (18px) | 1.6 | 400 | Lead paragraphs |
| `--text-body` | 1rem (16px) | 1.6 | 400 | Body text |
| `--text-small` | 0.875rem (14px) | 1.5 | 400 | Captions, meta |
| `--text-xs` | 0.75rem (12px) | 1.4 | 400 | Labels, badges |

### Type Scale (Mobile)
- Display: 2.25rem
- H1: 1.875rem
- H2: 1.5rem
- H3: 1.25rem
- Body remains 1rem

---

## Color Palette

### Primary Colors
```css
--color-primary-900: #0d2240;  /* Darkest blue - headings */
--color-primary-800: #133a6b;  /* Dark blue */
--color-primary-700: #1a4f8c;  /* Primary blue */
--color-primary-600: #2563a8;  /* Interactive blue */
--color-primary-500: #3b82c4;  /* Hover states */
--color-primary-400: #60a5e0;  /* Light accents */
--color-primary-100: #e8f2fc;  /* Subtle backgrounds */
--color-primary-50: #f4f9fe;   /* Lightest tint */
```

### Neutral Colors
```css
--color-neutral-900: #1a1a1a;  /* Primary text */
--color-neutral-700: #404040;  /* Secondary text */
--color-neutral-500: #737373;  /* Muted text */
--color-neutral-400: #a3a3a3;  /* Disabled states */
--color-neutral-300: #d4d4d4;  /* Borders */
--color-neutral-200: #e5e5e5;  /* Dividers */
--color-neutral-100: #f5f5f5;  /* Subtle backgrounds */
--color-neutral-50: #fafafa;   /* Card backgrounds */
```

### Accent Colors
```css
--color-accent-yellow: #f4c430;   /* Sparingly for dividers/highlights */
--color-accent-yellow-light: #fef9e7;  /* Very subtle background */
```

### Semantic Colors
```css
--color-success: #059669;
--color-success-light: #ecfdf5;
--color-error: #dc2626;
--color-error-light: #fef2f2;
--color-warning: #d97706;
--color-warning-light: #fffbeb;
--color-info: #2563eb;
--color-info-light: #eff6ff;
```

### Background Colors
```css
--color-bg-white: #ffffff;
--color-bg-off-white: #fafafa;
--color-bg-cream: #f9f8f6;
```

---

## Spacing Scale

Based on 4px base unit:
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## Layout

### Container Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1200px;
--container-2xl: 1400px;
```

### Grid
- 12-column grid
- Gutter: 24px (desktop), 16px (mobile)
- Max content width: 1200px
- Side padding: 24px (desktop), 16px (mobile)

---

## Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

---

## Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
--shadow-card: 0 2px 8px rgb(0 0 0 / 0.06);
```

---

## Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
--transition-accordion: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Component Specifications

### Header
- Height: 72px (desktop), 64px (mobile)
- Background: white with subtle shadow on scroll
- Logo left, navigation centered or right
- Sticky on scroll with smooth transition

### Hero Section
- Full viewport width
- Height: 70vh (min 500px, max 700px)
- Image with overlay gradient (left to right: rgba(13, 34, 64, 0.85) to transparent)
- Text positioned left, max-width 600px
- White text on dark overlay

### Pillar Cards
- Background: white
- Border: 1px solid neutral-200
- Padding: 32px
- Hover: subtle shadow lift, border-color primary-400
- Icon/image area: 64px height
- Title: H3
- Description: body text, 3 lines max

### Service Cards
- Expandable accordion style
- Header: clickable, with title + type badge + chevron
- Expanded content: smooth height animation
- Summary visible by default
- Details revealed on expand

### Accordion (FAQ)
- Simple, clean
- Question: semibold, with +/- indicator
- Answer: regular weight, indented slightly
- Yellow accent line on left when expanded (subtle)

### Buttons
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | primary-700 | white | none |
| Secondary | white | primary-700 | primary-700 |
| Text | transparent | primary-700 | none |
| Disabled | neutral-200 | neutral-400 | none |

- Padding: 12px 24px
- Border radius: 6px
- Font: 16px, weight 500
- Hover: darken background 10%

### Form Fields
- Height: 48px
- Border: 1px solid neutral-300
- Border radius: 6px
- Focus: border primary-600, subtle shadow
- Label: above field, small text, semibold
- Error: border error, red text below

### Toast/Alert
- Fixed position bottom-right
- Max-width 400px
- Icon + message + optional action
- Auto-dismiss after 5s
- Subtle slide-in animation

---

## Page Wireframe Descriptions

### Home Page
1. **Header** - Logo, navigation (Home, Business Consultancy, Education Support, About, Contact)
2. **Hero** - Full-width image with text overlay left-aligned: headline, subheadline, CTA button
3. **Pillars Section** - Two equal cards side by side:
   - Business Consultancy (icon, brief statement, "Explore" link)
   - Education Support (icon, brief statement, "Explore" link)
4. **Footer** - Quick links, contact info, social icons, copyright

### Business Consultancy Page
1. Header
2. Page Hero - Smaller hero with pillar title and brief intro
3. One-off Services Section - Grid of service cards (expandable)
4. Subscription Services Section - Grid of service cards (expandable)
5. FAQ Section - Accordion
6. CTA Section - "Get in touch" banner
7. Footer

### Education Support Page
Same structure as Business Consultancy

### About Page
1. Header
2. Hero/Intro Section - Mission statement
3. Values Section - 3-4 value cards
4. Methodology Section - Approach explanation
5. Team Section (optional placeholder)
6. Footer

### Contact Page
1. Header
2. Contact Options - Three columns:
   - Call (RingCentral click-to-call)
   - Message (RingCentral SMS/message)
   - Email (standard mailto)
3. Contact Form - Name, email, phone, pillar interest dropdown, message
4. Office Hours Block
5. Footer

### Admin Dashboard
- Sidebar navigation
- Services management (CRUD)
- FAQ management (CRUD)
- Contact submissions list
- Integration settings
- Call logs view

---

## Accessibility Requirements

- Color contrast ratio: minimum 4.5:1 for text
- Focus states: visible outline (2px solid primary-600)
- Skip-to-content link
- Keyboard navigable accordions and dropdowns
- ARIA labels on interactive elements
- Reduced motion support
