# Thesis Directory Structure

This directory contains the whitepaper/book-style content that guides users through the macro investment framework thinking process.

## Structure

```
app/thesis/
├── layout.tsx              # Custom layout with sidebar
├── page.tsx               # Thesis home/introduction
├── foundation/            # Chapter 1: Foundation
│   ├── page.tsx
│   ├── market-cycles/
│   ├── economic-indicators/
│   └── asset-classes/
├── market-regimes/        # Chapter 2: Market Regimes
├── cycles-timing/         # Chapter 3: Cycles & Timing
└── implementation/        # Chapter 4: Implementation
```

## Components

- `components/thesis/thesis-sidebar.tsx` - Navigation sidebar
- `components/thesis/thesis-navigation.tsx` - Page navigation utility

## Images

Static images should be placed in `public/thesis/images/` and referenced using Next.js Image component.

## Content Guidelines

1. **Text-heavy content** with clear structure using headings
2. **Static images** (PNG/JPEG) to illustrate concepts
3. **Internal links** to other parts of the app using Next.js Link
4. **Consistent navigation** between chapters and sections
5. **Prose styling** using Tailwind typography classes

## Adding New Content

1. Create new directories under the appropriate chapter
2. Add page.tsx files with consistent structure
3. Update the sidebar navigation in `thesis-sidebar.tsx`
4. Add images to `public/thesis/images/`
5. Use the ThesisNavigation component for consistent page navigation