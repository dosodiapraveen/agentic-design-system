# Dark Mode Guidelines

This design system uses CSS custom properties for automatic dark mode support.

## How It Works

All components use design tokens (CSS custom properties) that automatically adjust based on the `dark` class on the root element.

```css
:root {
  --color-background: #F9FAFB;
  --color-text-primary: #111827;
}

:root.dark {
  --color-background: #0F172A;
  --color-text-primary: #F1F5F9;
}
```

## Implementation

### 1. Never Hardcode Colors

**Wrong:**
```css
.card {
  background: #ffffff;
  color: #333333;
}
```

**Correct:**
```css
.card {
  background: var(--color-surface);
  color: var(--color-text-primary);
}
```

### 2. Toggle Dark Mode

```javascript
// Toggle
function toggleTheme() {
  document.documentElement.classList.toggle('dark')
  const isDark = document.documentElement.classList.contains('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

// Initialize on page load
function initTheme() {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.toggle('dark', e.matches)
    }
  })
```

### 3. Use the Theme Toggle Component

```vue
<template>
  <BaseThemeToggle v-model="isDark" />
</template>

<script>
export default {
  data() {
    return {
      isDark: document.documentElement.classList.contains('dark')
    }
  },
  watch: {
    isDark(value) {
      document.documentElement.classList.toggle('dark', value)
      localStorage.setItem('theme', value ? 'dark' : 'light')
    }
  }
}
</script>
```

## Color Token Reference

### Background Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-background` | #F9FAFB | #0F172A | Page background |
| `--color-surface` | #FFFFFF | #1E293B | Cards, panels |
| `--color-surface-elevated` | #FFFFFF | #334155 | Modals, dropdowns |

### Text Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-text-primary` | #111827 | #F1F5F9 | Primary text |
| `--color-text-secondary` | #4B5563 | #94A3B8 | Secondary text |
| `--color-text-tertiary` | #9CA3AF | #64748B | Muted text |
| `--color-text-inverse` | #FFFFFF | #FFFFFF | Text on dark bg |

### Border Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-border` | #E5E7EB | #334155 | Default borders |
| `--color-border-light` | #F3F4F6 | #1E293B | Subtle borders |

## Common Patterns

### Shadows in Dark Mode

Shadows need adjustment for dark mode:

```css
.card {
  box-shadow: var(--shadow-md);
}

:root {
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:root.dark {
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}
```

### Images and Icons

For icons that need to adapt:

```css
.icon {
  color: var(--color-text-primary);
}

/* Or use currentColor */
.icon svg {
  fill: currentColor;
}
```

For images, consider using different assets:

```vue
<template>
  <img :src="isDark ? logoDark : logoLight" alt="Logo" />
</template>
```

### Skeleton Loading States

Skeletons need proper dark mode colors:

```css
.skeleton {
  background: var(--color-gray-200);
}

:root.dark .skeleton {
  background: var(--color-gray-700);
}

/* Shimmer animation */
.skeleton::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-gray-100),
    transparent
  );
}

:root.dark .skeleton::after {
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-gray-600),
    transparent
  );
}
```

## Testing Dark Mode

1. Toggle between modes and verify all text is readable
2. Check that no elements have hardcoded colors
3. Verify sufficient contrast in both modes
4. Test images and icons visibility
5. Check loading/skeleton states
6. Verify shadows and borders are visible

## Debugging

To find hardcoded colors:

```bash
# Search for hex colors in Vue files
grep -r "#[0-9A-Fa-f]\{3,6\}" src/components --include="*.vue"

# Search for rgb/rgba
grep -r "rgb\|rgba" src/components --include="*.vue"
```
