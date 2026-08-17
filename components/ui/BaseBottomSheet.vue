<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div
        v-if="modelValue"
        class="bottom-sheet-backdrop"
        :style="{ zIndex: zIndex }"
        @click="handleBackdropClick"
        @keydown.escape="handleEscape"
      >
        <div
          ref="sheetContent"
          :class="[
            'bottom-sheet-content',
            `bottom-sheet-${size}`,
            { 'bottom-sheet-fullscreen': fullscreen }
          ]"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          :style="sheetStyle"
          @click.stop
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- Drag Handle -->
          <div v-if="showHandle" class="bottom-sheet-handle">
            <div class="handle-bar" />
          </div>

          <!-- Header -->
          <div v-if="$slots.header || title" class="bottom-sheet-header">
            <slot name="header">
              <h2 :id="titleId" class="bottom-sheet-title">{{ title }}</h2>
            </slot>
            <button
              v-if="showClose"
              type="button"
              class="bottom-sheet-close"
              aria-label="Close"
              @click="close"
            >
              <BaseIcon name="x" :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div class="bottom-sheet-body" :class="{ 'no-padding': noPadding }">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="bottom-sheet-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

let sheetIdCounter = 0

export default {
  name: 'BaseBottomSheet',
  components: { BaseIcon },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: v => ['sm', 'md', 'lg', 'full'].includes(v)
    },
    showClose: {
      type: Boolean,
      default: true
    },
    showHandle: {
      type: Boolean,
      default: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    closeOnSwipeDown: {
      type: Boolean,
      default: true
    },
    swipeThreshold: {
      type: Number,
      default: 100
    },
    persistent: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 500
    }
  },
  emits: ['update:modelValue', 'close', 'open'],
  data() {
    return {
      titleId: `bottom-sheet-title-${++sheetIdCounter}`,
      previousActiveElement: null,
      // Swipe state
      startY: 0,
      currentY: 0,
      isDragging: false,
      translateY: 0
    }
  },
  computed: {
    sheetStyle() {
      if (this.translateY > 0) {
        return {
          transform: `translateY(${this.translateY}px)`,
          transition: this.isDragging ? 'none' : 'transform 0.3s ease-out'
        }
      }
      return {}
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        if (newVal) {
          this.onOpen()
        } else {
          this.onClose()
        }
      },
      immediate: true
    }
  },
  methods: {
    close() {
      if (!this.persistent) {
        this.$emit('update:modelValue', false)
        this.$emit('close')
      }
    },

    handleBackdropClick() {
      if (this.closeOnBackdrop && !this.persistent) {
        this.close()
      }
    },

    handleEscape() {
      if (this.closeOnEscape && !this.persistent) {
        this.close()
      }
    },

    // Swipe-to-dismiss handling
    onTouchStart(e) {
      if (!this.closeOnSwipeDown) return

      // Only start drag from handle area or top of sheet
      const touch = e.touches[0]
      const rect = this.$refs.sheetContent?.getBoundingClientRect()
      const touchFromTop = touch.clientY - rect.top

      // Allow drag from handle area (first 40px) or when scrolled to top
      const contentEl = this.$refs.sheetContent?.querySelector('.bottom-sheet-body')
      const isScrolledToTop = !contentEl || contentEl.scrollTop === 0

      if (touchFromTop <= 60 || isScrolledToTop) {
        this.startY = touch.clientY
        this.currentY = touch.clientY
        this.isDragging = true
      }
    },

    onTouchMove(e) {
      if (!this.isDragging) return

      const touch = e.touches[0]
      const deltaY = touch.clientY - this.startY

      // Only allow downward swipe
      if (deltaY > 0) {
        e.preventDefault()
        // Apply resistance
        this.translateY = deltaY * 0.8
        this.currentY = touch.clientY
      }
    },

    onTouchEnd() {
      if (!this.isDragging) return

      this.isDragging = false

      if (this.translateY >= this.swipeThreshold && !this.persistent) {
        // Dismiss
        this.close()
      }

      // Reset position
      this.translateY = 0
      this.startY = 0
      this.currentY = 0
    },

    onOpen() {
      this.previousActiveElement = document.activeElement
      document.body.style.overflow = 'hidden'
      this.translateY = 0
      this.$emit('open')

      this.$nextTick(() => {
        this.$refs.sheetContent?.focus()
      })
    },

    onClose() {
      document.body.style.overflow = ''
      this.$nextTick(() => {
        this.previousActiveElement?.focus()
      })
    }
  },
  beforeUnmount() {
    if (this.modelValue) {
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.bottom-sheet-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--modal-backdrop, rgba(0, 0, 0, 0.5));
  backdrop-filter: blur(4px);
  z-index: var(--z-modal-backdrop, 500);
}

.bottom-sheet-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 90vh;
  background: var(--color-surface);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  touch-action: pan-y;
}

/* Sizes */
.bottom-sheet-sm {
  max-height: 40vh;
}

.bottom-sheet-md {
  max-height: 60vh;
}

.bottom-sheet-lg {
  max-height: 80vh;
}

.bottom-sheet-full {
  max-height: 95vh;
}

.bottom-sheet-fullscreen {
  max-height: 100vh;
  border-radius: 0;
}

/* Drag Handle */
.bottom-sheet-handle {
  display: flex;
  justify-content: center;
  padding: var(--spacing-3) 0;
  flex-shrink: 0;
  cursor: grab;
}

.bottom-sheet-handle:active {
  cursor: grabbing;
}

.handle-bar {
  width: 36px;
  height: 4px;
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.bottom-sheet-handle:hover .handle-bar {
  background: var(--color-gray-400);
}

/* Header */
.bottom-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-5);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.bottom-sheet-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.bottom-sheet-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.bottom-sheet-close:hover {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
}

.bottom-sheet-close:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Body */
.bottom-sheet-body {
  flex: 1;
  padding: var(--spacing-5);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.bottom-sheet-body.no-padding {
  padding: 0;
}

/* Footer */
.bottom-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-5);
  padding-bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom, 0));
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

/* Animations */
.bottom-sheet-enter-active {
  animation: backdropIn var(--transition-base) ease-out;
}

.bottom-sheet-leave-active {
  animation: backdropOut var(--transition-fast) ease-in;
}

.bottom-sheet-enter-active .bottom-sheet-content {
  animation: sheetSlideIn var(--transition-slow) cubic-bezier(0.32, 0.72, 0, 1);
}

.bottom-sheet-leave-active .bottom-sheet-content {
  animation: sheetSlideOut var(--transition-base) ease-in;
}

@keyframes backdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes backdropOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes sheetSlideIn {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes sheetSlideOut {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

/* Desktop: Center the sheet and constrain width */
@media (min-width: 640px) {
  .bottom-sheet-content {
    max-width: 500px;
    border-radius: var(--radius-2xl);
    margin-bottom: var(--spacing-8);
  }

  .bottom-sheet-footer {
    padding-bottom: var(--spacing-4);
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .bottom-sheet-enter-active,
  .bottom-sheet-leave-active,
  .bottom-sheet-enter-active .bottom-sheet-content,
  .bottom-sheet-leave-active .bottom-sheet-content {
    animation: none;
  }
}
</style>
