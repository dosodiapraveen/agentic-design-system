# Agentic Design System

A Vue 3 design system optimized for AI-assisted development. This file provides quick reference patterns for AI coding agents.

## Quick Start

```bash
# Copy components to your project
cp -r components/ your-project/src/components/
cp -r composables/ your-project/src/composables/
cp tokens/design-tokens.css your-project/src/styles/
```

## Core Principles

1. **Design Tokens First** - Never hardcode colors, spacing, or typography
2. **Dark Mode Native** - All components support light/dark themes via CSS custom properties
3. **Mobile First** - 48px minimum touch targets, responsive breakpoints
4. **Accessibility Built-in** - ARIA landmarks, skip links, semantic HTML
5. **Error Resilient** - Error boundaries, loading states, empty states

---

## Design Tokens

Always use design tokens from `tokens/design-tokens.css`. Import in your main CSS:

```css
@import './design-tokens.css';
```

### Color Tokens

```css
/* Brand colors */
--color-primary-500: #6366F1;    /* Primary actions */
--color-primary-600: #4F46E5;    /* Primary hover */

/* Semantic colors */
--color-success-500: #22C55E;
--color-warning-500: #F59E0B;
--color-error-500: #EF4444;

/* Text colors (auto-adjust for dark mode) */
--color-text-primary      /* Main text */
--color-text-secondary    /* Secondary text */
--color-text-tertiary     /* Muted text */
--color-text-inverse      /* Text on dark backgrounds */

/* Background colors */
--color-background        /* Page background */
--color-surface           /* Card/panel background */
--color-surface-elevated  /* Modal/dropdown background */
```

### Spacing Scale

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
```

### Typography

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-md: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Border Radius

```css
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;
--radius-2xl: 1rem;
--radius-full: 9999px;
```

---

## Component Reference

### UI Components (`components/ui/`)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `BaseButton` | Primary button component | `variant`, `size`, `loading`, `disabled` |
| `BaseInput` | Text input with validation | `type`, `placeholder`, `error`, `disabled` |
| `BaseSelect` | Dropdown select | `options`, `placeholder`, `multiple` |
| `BaseModal` | Dialog/modal overlay | `modelValue`, `title`, `size` |
| `BaseCard` | Content container | `padding`, `hoverable` |
| `BaseBadge` | Status/label badge | `variant`, `size` |
| `BaseToast` | Notification toast | `type`, `message`, `duration` |
| `BaseToggle` | On/off switch | `modelValue`, `disabled` |
| `BaseTooltip` | Hover tooltip | `content`, `position` |
| `BaseDateTimePicker` | Date/time input | `modelValue`, `type` |
| `BaseEmptyState` | No data placeholder | `icon`, `title`, `description` |
| `BaseSearchFilter` | Search with filters | `modelValue`, `filters` |
| `BaseIcon` | SVG icon component | `name`, `size` |
| `BaseThemeToggle` | Dark/light mode switch | `modelValue` |
| `BaseConfirmDialog` | Confirmation modal | `title`, `message`, `variant`, `loading` |
| `BaseChart` | Chart wrapper | `type`, `data`, `options` |

### Common Components (`components/common/`)

| Component | Purpose |
|-----------|---------|
| `ErrorBoundary` | Catches and displays errors gracefully |
| `LoadingSpinner` | Loading indicator |
| `EmptyState` | No data state |
| `ConfirmDialog` | Simple confirmation |
| `SuccessToast` | Success notification |

### Base Components (`components/base/`)

| Component | Purpose |
|-----------|---------|
| `BaseSkeleton` | Loading skeleton with shimmer |
| `BaseSkeletonGroup` | Pre-built skeleton patterns |

---

## Common Patterns

### 1. Loading States with Skeleton

```vue
<template>
  <div v-if="loading">
    <BaseSkeleton variant="card" />
    <BaseSkeleton variant="text" :lines="3" />
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### 2. Error Boundary Wrapper

```vue
<template>
  <ErrorBoundary @error="handleError" @retry="fetchData">
    <YourComponent />
  </ErrorBoundary>
</template>
```

### 3. Confirmation Before Delete

```vue
<template>
  <BaseConfirmDialog
    v-model="showConfirm"
    title="Delete Item"
    message="This action cannot be undone."
    variant="danger"
    :loading="deleting"
    @confirm="handleDelete"
  />
</template>

<script>
export default {
  data() {
    return {
      showConfirm: false,
      deleting: false
    }
  },
  methods: {
    async handleDelete() {
      this.deleting = true
      try {
        await this.api('DELETE', `/api/items/${this.itemId}`)
        this.showConfirm = false
        this.showToast('Item deleted')
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>
```

### 4. Toast Notifications

```javascript
import { useToast } from '@/composables/useToast'

// In component
const { showToast } = useToast()

// Usage
showToast('Success message', 'success')
showToast('Error occurred', 'error')
showToast('Please note...', 'warning')
```

### 5. Empty State

```vue
<template>
  <BaseEmptyState
    v-if="items.length === 0"
    icon="inbox"
    title="No items yet"
    description="Create your first item to get started."
  >
    <BaseButton @click="openModal">Create Item</BaseButton>
  </BaseEmptyState>
</template>
```

### 6. Form with Validation

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput
      v-model="form.email"
      type="email"
      label="Email"
      :error="errors.email"
      required
    />
    <BaseButton type="submit" :loading="submitting">
      Submit
    </BaseButton>
  </form>
</template>
```

---

## Accessibility Checklist

When building views, always include:

### Skip Links
```vue
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#nav" class="skip-link">Skip to navigation</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary-500);
  color: white;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
```

### ARIA Landmarks
```vue
<header role="banner">...</header>
<nav role="navigation" aria-label="Main navigation">...</nav>
<main id="main-content" role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### Heading Hierarchy
- One `<h1>` per page (page title)
- Sequential heading levels (h1 → h2 → h3, never skip)
- Use headings for structure, not styling

### Touch Targets
```css
/* Minimum 48x48px for touch */
.touch-target {
  min-width: 48px;
  min-height: 48px;
  padding: var(--spacing-3);
}

@media (min-width: 768px) {
  .touch-target {
    min-width: 36px;
    min-height: 36px;
    padding: var(--spacing-2);
  }
}
```

---

## Mobile Patterns

### Responsive Navigation
```vue
<template>
  <button
    class="mobile-menu-btn"
    @click="menuOpen = !menuOpen"
    aria-label="Toggle menu"
  >
    <BaseIcon :name="menuOpen ? 'x' : 'menu'" />
  </button>

  <nav :class="{ 'nav-open': menuOpen }">
    <!-- Nav items -->
  </nav>
</template>

<style>
.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
    min-width: 48px;
    min-height: 48px;
  }

  nav {
    display: none;
  }

  nav.nav-open {
    display: block;
    position: fixed;
    inset: 0;
    background: var(--color-surface);
    z-index: 50;
  }
}
</style>
```

### Breakpoints
```css
/* Mobile first approach */
/* Default: Mobile (< 640px) */

@media (min-width: 640px) { /* sm: Tablet */ }
@media (min-width: 768px) { /* md: Tablet landscape */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large desktop */ }
```

---

## Dark Mode

Dark mode is automatic via CSS custom properties. The design tokens file includes:

```css
:root {
  /* Light mode (default) */
  --color-background: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-text-primary: #111827;
}

:root.dark {
  /* Dark mode */
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-text-primary: #F1F5F9;
}
```

### Toggle Theme
```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark')

// Check preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

// Persist choice
localStorage.setItem('theme', isDark ? 'dark' : 'light')
```

---

## API Error Handling Pattern

```javascript
async api(method, url, body, options = {}) {
  const { silent = false } = options

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMsg = data.detail || data.message || `Request failed (${response.status})`
      if (!silent) this.showToast(errorMsg, 'error')
      return { error: true, status: response.status, message: errorMsg }
    }

    return data
  } catch (e) {
    if (!silent) this.showToast('Network error. Please check your connection.', 'error')
    return { error: true, message: e.message }
  }
}
```

---

## File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   └── index.js     # Barrel export
│   ├── common/          # Shared utility components
│   │   ├── ErrorBoundary.vue
│   │   └── LoadingSpinner.vue
│   └── [feature]/       # Feature-specific components
├── composables/         # Vue composables
│   └── useToast.js
├── styles/
│   └── design-tokens.css
└── views/               # Page components
```

---

## Checklist for New Views

- [ ] Import design tokens CSS
- [ ] Add skip navigation links
- [ ] Add ARIA landmarks (header, nav, main, footer)
- [ ] Use semantic heading hierarchy (h1 → h2 → h3)
- [ ] Wrap content in ErrorBoundary
- [ ] Add loading skeletons for async data
- [ ] Add empty states for no-data scenarios
- [ ] Wire API calls to toast notifications
- [ ] Use BaseConfirmDialog for destructive actions
- [ ] Test mobile layout (hamburger menu if needed)
- [ ] Verify 48px touch targets on mobile
- [ ] Test dark mode appearance
- [ ] Test with keyboard navigation
