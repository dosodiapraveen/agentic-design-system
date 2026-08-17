<template>
  <div :class="['fab-container', `fab-${position}`]">
    <!-- Speed dial items (when expanded) -->
    <Transition name="speed-dial">
      <div v-if="expanded && items.length" class="fab-speed-dial">
        <div
          v-for="(item, index) in items"
          :key="item.id || index"
          class="fab-speed-dial-item"
          :style="{ '--delay': `${index * 50}ms` }"
        >
          <span v-if="item.label" class="fab-item-label">{{ item.label }}</span>
          <button
            type="button"
            :class="['fab', 'fab-mini', item.variant ? `fab-${item.variant}` : '']"
            :aria-label="item.label"
            :disabled="item.disabled"
            @click="handleItemClick(item)"
          >
            <BaseIcon :name="item.icon" :size="20" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main FAB button -->
    <button
      type="button"
      :class="[
        'fab',
        `fab-${size}`,
        `fab-${variant}`,
        { 'fab-extended': extended && label },
        { 'fab-expanded': expanded }
      ]"
      :aria-label="ariaLabel || label"
      :aria-expanded="items.length ? expanded : undefined"
      :disabled="disabled"
      @click="handleClick"
    >
      <Transition name="fab-icon" mode="out-in">
        <BaseIcon
          :key="expanded ? 'close' : icon"
          :name="expanded ? closeIcon : icon"
          :size="size === 'lg' ? 28 : 24"
          :class="{ 'fab-icon-rotate': expanded }"
        />
      </Transition>
      <span v-if="extended && label" class="fab-label">{{ label }}</span>
    </button>

    <!-- Backdrop for speed dial -->
    <Transition name="fade">
      <div
        v-if="expanded && items.length"
        class="fab-backdrop"
        @click="expanded = false"
      />
    </Transition>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'BaseFab',
  components: { BaseIcon },
  props: {
    icon: {
      type: String,
      default: 'plus'
    },
    closeIcon: {
      type: String,
      default: 'x'
    },
    label: {
      type: String,
      default: ''
    },
    ariaLabel: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'primary',
      validator: v => ['primary', 'secondary', 'success', 'error', 'warning'].includes(v)
    },
    size: {
      type: String,
      default: 'md',
      validator: v => ['sm', 'md', 'lg'].includes(v)
    },
    position: {
      type: String,
      default: 'bottom-right',
      validator: v => ['bottom-right', 'bottom-left', 'bottom-center'].includes(v)
    },
    extended: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
      // { id, icon, label, action, variant, disabled }
    }
  },
  emits: ['click', 'select'],
  data() {
    return {
      expanded: false
    }
  },
  methods: {
    handleClick(e) {
      if (this.items.length) {
        this.expanded = !this.expanded
      } else {
        this.$emit('click', e)
      }
    },

    handleItemClick(item) {
      if (item.disabled) return

      if (item.action) {
        item.action()
      }

      this.$emit('select', item)
      this.expanded = false
    },

    close() {
      this.expanded = false
    }
  }
}
</script>

<style scoped>
.fab-container {
  position: fixed;
  z-index: var(--z-fab, 400);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}

.fab-bottom-right {
  bottom: calc(var(--spacing-5) + env(safe-area-inset-bottom, 0));
  right: var(--spacing-5);
}

.fab-bottom-left {
  bottom: calc(var(--spacing-5) + env(safe-area-inset-bottom, 0));
  left: var(--spacing-5);
}

.fab-bottom-center {
  bottom: calc(var(--spacing-5) + env(safe-area-inset-bottom, 0));
  left: 50%;
  transform: translateX(-50%);
}

/* FAB Button */
.fab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.fab:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: var(--shadow-xl);
}

.fab:active:not(:disabled) {
  transform: scale(0.98);
}

.fab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fab:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Sizes */
.fab-sm {
  width: 40px;
  height: 40px;
}

.fab-md {
  width: 56px;
  height: 56px;
}

.fab-lg {
  width: 72px;
  height: 72px;
}

.fab-mini {
  width: 40px;
  height: 40px;
}

/* Extended FAB */
.fab-extended {
  width: auto;
  padding: 0 var(--spacing-5);
  border-radius: var(--radius-xl);
}

.fab-extended.fab-sm {
  height: 40px;
  padding: 0 var(--spacing-4);
}

.fab-extended.fab-md {
  height: 48px;
}

.fab-extended.fab-lg {
  height: 56px;
}

.fab-label {
  white-space: nowrap;
}

/* Variants */
.fab-primary {
  background: var(--color-primary-500);
  color: var(--color-text-inverse);
}

.fab-primary:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.fab-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.fab-secondary:hover:not(:disabled) {
  background: var(--color-gray-100);
}

.fab-success {
  background: var(--color-success-500);
  color: var(--color-text-inverse);
}

.fab-success:hover:not(:disabled) {
  background: var(--color-success-600);
}

.fab-error {
  background: var(--color-error-500);
  color: var(--color-text-inverse);
}

.fab-error:hover:not(:disabled) {
  background: var(--color-error-600);
}

.fab-warning {
  background: var(--color-warning-500);
  color: var(--color-text-inverse);
}

.fab-warning:hover:not(:disabled) {
  background: var(--color-warning-600);
}

/* Speed dial */
.fab-speed-dial {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.fab-speed-dial-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  animation: speedDialItemIn var(--transition-base) ease-out backwards;
  animation-delay: var(--delay, 0ms);
}

.fab-bottom-right .fab-speed-dial-item {
  flex-direction: row-reverse;
}

.fab-item-label {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

/* Icon rotation when expanded */
.fab-expanded .fab-icon-rotate {
  transform: rotate(45deg);
}

/* Backdrop */
.fab-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

/* Animations */
.speed-dial-enter-active,
.speed-dial-leave-active {
  transition: opacity var(--transition-base);
}

.speed-dial-enter-from,
.speed-dial-leave-to {
  opacity: 0;
}

@keyframes speedDialItemIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fab-icon-enter-active,
.fab-icon-leave-active {
  transition: all var(--transition-fast);
}

.fab-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.fab-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .fab-bottom-right {
    bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom, 0) + 60px); /* Account for bottom nav */
    right: var(--spacing-4);
  }

  .fab-bottom-left {
    bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom, 0) + 60px);
    left: var(--spacing-4);
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .fab-speed-dial-item {
    animation: none;
  }

  .fab:hover:not(:disabled) {
    transform: none;
  }
}
</style>
