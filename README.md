# Agentic Design System

A Vue 3 design system optimized for AI-assisted development. Built with accessibility, dark mode, and mobile-first principles.

## Features

- **Design Tokens** - CSS custom properties for colors, spacing, typography
- **Dark Mode** - Automatic light/dark theme support
- **Accessibility** - WCAG 2.1 AA compliant patterns
- **Mobile First** - Responsive components with proper touch targets
- **AI-Optimized** - CLAUDE.md reference for AI coding agents

## Quick Start

### Option 1: Copy Components

```bash
# Clone the repo
git clone https://github.com/dosodiapraveen/agentic-design-system.git

# Copy to your project
cp -r agentic-design-system/components/ your-project/src/components/
cp -r agentic-design-system/composables/ your-project/src/composables/
cp agentic-design-system/tokens/design-tokens.css your-project/src/styles/
```

### Option 2: Git Submodule

```bash
# Add as submodule
git submodule add https://github.com/dosodiapraveen/agentic-design-system.git src/design-system

# Import in your project
# In main.js or App.vue:
import '@/design-system/tokens/design-tokens.css'

# Import components
import { BaseButton, BaseInput } from '@/design-system/components/ui'
```

## Directory Structure

```
agentic-design-system/
├── CLAUDE.md                    # AI agent reference (Claude Code reads this)
├── README.md                    # This file
│
├── tokens/
│   └── design-tokens.css        # CSS custom properties
│
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseSelect.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseBadge.vue
│   │   ├── BaseToast.vue
│   │   ├── BaseToggle.vue
│   │   ├── BaseTooltip.vue
│   │   ├── BaseDateTimePicker.vue
│   │   ├── BaseEmptyState.vue
│   │   ├── BaseSearchFilter.vue
│   │   ├── BaseIcon.vue
│   │   ├── BaseThemeToggle.vue
│   │   ├── BaseConfirmDialog.vue
│   │   ├── BaseChart.vue
│   │   └── index.js
│   │
│   ├── common/                  # Utility components
│   │   ├── ErrorBoundary.vue
│   │   ├── LoadingSpinner.vue
│   │   ├── EmptyState.vue
│   │   ├── ConfirmDialog.vue
│   │   └── SuccessToast.vue
│   │
│   └── base/                    # Loading components
│       ├── BaseSkeleton.vue
│       └── BaseSkeletonGroup.vue
│
├── composables/
│   └── useToast.js              # Toast notification composable
│
└── guidelines/
    ├── accessibility.md         # A11y patterns
    ├── dark-mode.md             # Theming guide
    ├── mobile-first.md          # Responsive patterns
    └── error-handling.md        # Error handling patterns
```

## Components

### UI Components

| Component | Description |
|-----------|-------------|
| `BaseButton` | Button with variants, sizes, loading state |
| `BaseInput` | Text input with validation, icons |
| `BaseSelect` | Dropdown select with search |
| `BaseModal` | Dialog/modal overlay |
| `BaseCard` | Content container |
| `BaseBadge` | Status/label badges |
| `BaseToast` | Notification toasts |
| `BaseToggle` | On/off switch |
| `BaseTooltip` | Hover tooltips |
| `BaseDateTimePicker` | Date/time picker |
| `BaseEmptyState` | Empty state placeholder |
| `BaseSearchFilter` | Search with filters |
| `BaseIcon` | SVG icon component |
| `BaseThemeToggle` | Dark/light mode toggle |
| `BaseConfirmDialog` | Confirmation dialog |
| `BaseChart` | Chart wrapper |

### Common Components

| Component | Description |
|-----------|-------------|
| `ErrorBoundary` | Catches errors, shows recovery options |
| `LoadingSpinner` | Loading indicator |
| `EmptyState` | No data state |
| `ConfirmDialog` | Simple confirmation modal |

### Loading Components

| Component | Description |
|-----------|-------------|
| `BaseSkeleton` | Skeleton with shimmer animation |
| `BaseSkeletonGroup` | Pre-built skeleton patterns |

## Design Tokens

Import the design tokens CSS in your main stylesheet:

```css
@import './design-tokens.css';
```

### Color Tokens

```css
/* Primary */
--color-primary-500
--color-primary-600

/* Semantic */
--color-success-500
--color-warning-500
--color-error-500

/* Text */
--color-text-primary
--color-text-secondary
--color-text-tertiary

/* Background */
--color-background
--color-surface
--color-surface-elevated
```

### Spacing

```css
--spacing-1  /* 4px */
--spacing-2  /* 8px */
--spacing-3  /* 12px */
--spacing-4  /* 16px */
--spacing-6  /* 24px */
--spacing-8  /* 32px */
```

### Typography

```css
--font-size-xs
--font-size-sm
--font-size-md
--font-size-lg
--font-size-xl
```

## For AI Coding Agents

This design system includes `CLAUDE.md` - a comprehensive reference file that AI coding agents (like Claude Code) automatically read. It contains:

- Quick reference for all components
- Code patterns and examples
- Accessibility checklist
- Mobile-first patterns
- Dark mode implementation
- Error handling patterns

When working with this design system, AI agents will automatically follow these patterns and use the correct components.

## Guidelines

Detailed documentation is available in the `guidelines/` directory:

- [Accessibility](guidelines/accessibility.md) - ARIA, focus management, screen readers
- [Dark Mode](guidelines/dark-mode.md) - Theming with CSS custom properties
- [Mobile First](guidelines/mobile-first.md) - Responsive patterns, touch targets
- [Error Handling](guidelines/error-handling.md) - Error boundaries, toasts, validation

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT
