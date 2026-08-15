# Mobile-First Guidelines

Build interfaces starting from mobile and progressively enhance for larger screens.

## Breakpoints

```css
/* Mobile first - default styles apply to mobile */
.element {
  /* Mobile styles (< 640px) */
}

@media (min-width: 640px) {
  .element {
    /* Small tablet (640px+) */
  }
}

@media (min-width: 768px) {
  .element {
    /* Tablet landscape (768px+) */
  }
}

@media (min-width: 1024px) {
  .element {
    /* Desktop (1024px+) */
  }
}

@media (min-width: 1280px) {
  .element {
    /* Large desktop (1280px+) */
  }
}
```

## Touch Targets

All interactive elements must have minimum 48x48px touch targets on mobile.

```css
.button,
.link,
.nav-item {
  min-width: 48px;
  min-height: 48px;
  padding: var(--spacing-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Reduce on desktop with precise pointers */
@media (min-width: 768px) and (pointer: fine) {
  .button,
  .link,
  .nav-item {
    min-width: 36px;
    min-height: 36px;
    padding: var(--spacing-2);
  }
}
```

## Responsive Navigation

### Mobile Hamburger Menu

```vue
<template>
  <header class="header">
    <div class="header-brand">
      <Logo />
    </div>

    <button
      class="mobile-menu-btn"
      @click="menuOpen = !menuOpen"
      :aria-expanded="menuOpen"
      aria-label="Toggle navigation menu"
    >
      <BaseIcon :name="menuOpen ? 'x' : 'menu'" :size="24" />
    </button>

    <nav class="nav" :class="{ 'nav-open': menuOpen }">
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.key">
          <a
            :href="item.href"
            class="nav-item"
            @click="menuOpen = false"
          >
            <BaseIcon :name="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: var(--color-surface);
}

.mobile-menu-btn {
  display: flex;
  min-width: 48px;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
}

.nav {
  display: none;
}

.nav.nav-open {
  display: block;
  position: fixed;
  inset: 0;
  top: 64px;
  background: var(--color-surface);
  z-index: 50;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: var(--spacing-4);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  min-height: 48px;
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-lg);
}

.nav-item:hover {
  background: var(--color-gray-100);
}

/* Desktop: Show nav, hide hamburger */
@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }

  .nav {
    display: flex;
  }

  .nav-list {
    display: flex;
    gap: var(--spacing-2);
    padding: 0;
  }

  .nav-item {
    padding: var(--spacing-2) var(--spacing-4);
    min-height: 40px;
  }
}
</style>
```

## Responsive Grid

```css
.grid {
  display: grid;
  gap: var(--spacing-4);

  /* Single column on mobile */
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid {
    /* 2 columns on tablet */
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    /* 3 columns on desktop */
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid {
    /* 4 columns on large desktop */
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Responsive Typography

```css
.heading {
  font-size: var(--font-size-xl);
  line-height: var(--line-height-tight);
}

@media (min-width: 768px) {
  .heading {
    font-size: var(--font-size-2xl);
  }
}

@media (min-width: 1024px) {
  .heading {
    font-size: var(--font-size-3xl);
  }
}
```

## Responsive Spacing

```css
.section {
  padding: var(--spacing-4);
}

@media (min-width: 768px) {
  .section {
    padding: var(--spacing-8);
  }
}

@media (min-width: 1024px) {
  .section {
    padding: var(--spacing-12);
  }
}
```

## Container Widths

```css
.container {
  width: 100%;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
  margin: 0 auto;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

## Responsive Tables

```css
/* Mobile: Stack table rows */
@media (max-width: 767px) {
  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
  }

  thead {
    display: none;
  }

  tr {
    margin-bottom: var(--spacing-4);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4);
  }

  td {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-2) 0;
    border-bottom: 1px solid var(--color-border-light);
  }

  td::before {
    content: attr(data-label);
    font-weight: var(--font-weight-semibold);
  }
}
```

## Modal/Dialog on Mobile

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  padding: 0;
}

.modal-content {
  width: 100%;
  max-height: 90vh;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  background: var(--color-surface);
  overflow-y: auto;
}

/* Desktop: Center modal */
@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
    justify-content: center;
    padding: var(--spacing-4);
  }

  .modal-content {
    max-width: 500px;
    max-height: 85vh;
    border-radius: var(--radius-xl);
  }
}
```

## Testing Checklist

- [ ] Test on actual mobile device (not just browser resize)
- [ ] Touch targets are 48x48px minimum
- [ ] Navigation works with hamburger menu
- [ ] Forms are usable on small screens
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Modals/dialogs work on mobile
- [ ] Images scale appropriately
- [ ] Tap gestures work (no hover-only states)
