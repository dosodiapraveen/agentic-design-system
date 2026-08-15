# Accessibility Guidelines

This document outlines accessibility patterns and requirements for building inclusive interfaces.

## Core Requirements

### 1. Skip Navigation Links

Always provide skip links at the top of the page for keyboard users.

```vue
<template>
  <div>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <a href="#navigation" class="skip-link">Skip to navigation</a>

    <header>...</header>
    <nav id="navigation">...</nav>
    <main id="main-content">...</main>
  </div>
</template>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
  z-index: 100;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
</style>
```

### 2. ARIA Landmarks

Use semantic HTML and ARIA roles to define page regions.

```html
<header role="banner">
  <!-- Site logo, search, user menu -->
</header>

<nav role="navigation" aria-label="Main navigation">
  <!-- Primary navigation -->
</nav>

<nav role="navigation" aria-label="Breadcrumb">
  <!-- Secondary navigation -->
</nav>

<main role="main" id="main-content">
  <!-- Primary content -->
</main>

<aside role="complementary">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### 3. Heading Hierarchy

Maintain proper heading levels for screen reader navigation.

**Do:**
```html
<h1>Page Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection</h3>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
```

**Don't:**
```html
<h1>Page Title</h1>
<h3>Section</h3>  <!-- Skipped h2! -->
<h5>Another</h5>  <!-- Skipped h4! -->
```

### 4. Focus Management

Ensure visible focus indicators and logical tab order.

```css
/* Never remove focus outlines entirely */
:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Use focus-visible for mouse vs keyboard */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### 5. Touch Targets

Minimum touch target size of 48x48 pixels on mobile.

```css
.interactive-element {
  min-width: 48px;
  min-height: 48px;
  padding: var(--spacing-3);
}

/* Can reduce on desktop with pointer devices */
@media (min-width: 768px) and (pointer: fine) {
  .interactive-element {
    min-width: 32px;
    min-height: 32px;
  }
}
```

### 6. Form Accessibility

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Always associate labels with inputs -->
    <label for="email">Email address</label>
    <input
      id="email"
      type="email"
      v-model="email"
      aria-describedby="email-error"
      :aria-invalid="!!errors.email"
    />
    <span id="email-error" role="alert" v-if="errors.email">
      {{ errors.email }}
    </span>

    <!-- Use fieldset for related inputs -->
    <fieldset>
      <legend>Notification preferences</legend>
      <label>
        <input type="checkbox" v-model="prefs.email" />
        Email notifications
      </label>
      <label>
        <input type="checkbox" v-model="prefs.sms" />
        SMS notifications
      </label>
    </fieldset>

    <button type="submit" :disabled="submitting">
      {{ submitting ? 'Submitting...' : 'Submit' }}
    </button>
  </form>
</template>
```

### 7. Images and Icons

```vue
<!-- Decorative images -->
<img src="decoration.png" alt="" role="presentation" />

<!-- Informative images -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024" />

<!-- Icon buttons need labels -->
<button aria-label="Close dialog">
  <BaseIcon name="x" aria-hidden="true" />
</button>

<!-- Icons with visible text -->
<button>
  <BaseIcon name="save" aria-hidden="true" />
  <span>Save</span>
</button>
```

### 8. Dynamic Content

```vue
<template>
  <!-- Announce loading states -->
  <div aria-live="polite" aria-busy="loading">
    <span v-if="loading">Loading content...</span>
  </div>

  <!-- Announce errors -->
  <div role="alert" v-if="error">
    {{ error }}
  </div>

  <!-- Announce success -->
  <div role="status" aria-live="polite" v-if="success">
    Changes saved successfully
  </div>
</template>
```

### 9. Modal Dialogs

```vue
<template>
  <div
    v-if="open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <h2 id="dialog-title">Confirm Delete</h2>
    <p id="dialog-description">
      Are you sure you want to delete this item?
    </p>

    <button @click="confirm">Delete</button>
    <button @click="cancel" ref="cancelBtn">Cancel</button>
  </div>
</template>

<script>
export default {
  watch: {
    open(isOpen) {
      if (isOpen) {
        // Trap focus in modal
        this.$nextTick(() => {
          this.$refs.cancelBtn?.focus()
        })
      }
    }
  }
}
</script>
```

### 10. Color Contrast

Ensure sufficient contrast ratios:
- **Normal text:** 4.5:1 minimum
- **Large text (18px+ or 14px+ bold):** 3:1 minimum
- **UI components and graphics:** 3:1 minimum

```css
/* Good contrast */
.text-on-light {
  color: var(--color-gray-900); /* #111827 on white = 17.4:1 */
}

.text-on-dark {
  color: var(--color-gray-100); /* #F3F4F6 on dark = 12.6:1 */
}

/* Avoid low contrast */
.bad-contrast {
  color: var(--color-gray-400); /* Too light on white */
}
```

## Testing Checklist

- [ ] Tab through entire page - logical order?
- [ ] All interactive elements focusable?
- [ ] Focus indicators visible?
- [ ] Screen reader announces content correctly?
- [ ] Works without mouse?
- [ ] Touch targets 48px+ on mobile?
- [ ] Color contrast passes WCAG AA?
- [ ] No content conveyed by color alone?
- [ ] Reduced motion respected?
- [ ] Error messages associated with inputs?

## Reduced Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
