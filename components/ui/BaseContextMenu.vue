<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="isOpen"
        class="context-menu-backdrop"
        @click="close"
        @contextmenu.prevent="close"
      >
        <div
          ref="menuContent"
          class="context-menu"
          :style="menuStyle"
          role="menu"
          :aria-label="ariaLabel"
          @click.stop
        >
          <slot>
            <div
              v-for="(item, index) in items"
              :key="item.id || index"
              :class="[
                'context-menu-item',
                { 'context-menu-item--danger': item.danger },
                { 'context-menu-item--disabled': item.disabled },
                { 'context-menu-item--divider': item.divider }
              ]"
              role="menuitem"
              :aria-disabled="item.disabled"
              @click="handleItemClick(item)"
            >
              <template v-if="!item.divider">
                <BaseIcon v-if="item.icon" :name="item.icon" :size="18" />
                <span class="item-label">{{ item.label }}</span>
                <span v-if="item.shortcut" class="item-shortcut">{{ item.shortcut }}</span>
              </template>
            </div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'BaseContextMenu',
  components: { BaseIcon },
  props: {
    items: {
      type: Array,
      default: () => []
      // { id, label, icon, shortcut, action, danger, disabled, divider }
    },
    ariaLabel: {
      type: String,
      default: 'Context menu'
    }
  },
  emits: ['select', 'close'],
  data() {
    return {
      isOpen: false,
      position: { x: 0, y: 0 },
      contextData: null
    }
  },
  computed: {
    menuStyle() {
      return {
        top: `${this.position.y}px`,
        left: `${this.position.x}px`
      }
    }
  },
  mounted() {
    // Close on escape
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    /**
     * Open the context menu at specified position
     * @param {Object} options - { x, y, data }
     */
    open(options = {}) {
      const { x = 0, y = 0, data = null } = options

      this.contextData = data
      this.isOpen = true

      // Position will be adjusted after render
      this.$nextTick(() => {
        this.adjustPosition(x, y)
      })
    },

    /**
     * Close the context menu
     */
    close() {
      this.isOpen = false
      this.contextData = null
      this.$emit('close')
    },

    /**
     * Adjust position to keep menu in viewport
     */
    adjustPosition(x, y) {
      const menu = this.$refs.menuContent
      if (!menu) {
        this.position = { x, y }
        return
      }

      const menuRect = menu.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const padding = 8

      let adjustedX = x
      let adjustedY = y

      // Adjust horizontal position
      if (x + menuRect.width > viewportWidth - padding) {
        adjustedX = viewportWidth - menuRect.width - padding
      }
      if (adjustedX < padding) {
        adjustedX = padding
      }

      // Adjust vertical position
      if (y + menuRect.height > viewportHeight - padding) {
        adjustedY = viewportHeight - menuRect.height - padding
      }
      if (adjustedY < padding) {
        adjustedY = padding
      }

      this.position = { x: adjustedX, y: adjustedY }
    },

    handleItemClick(item) {
      if (item.disabled || item.divider) return

      // Call item action if defined
      if (item.action) {
        item.action(this.contextData)
      }

      // Emit select event
      this.$emit('select', {
        item,
        data: this.contextData
      })

      this.close()
    },

    handleKeydown(e) {
      if (!this.isOpen) return

      if (e.key === 'Escape') {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.context-menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-popover, 600);
}

.context-menu {
  position: fixed;
  min-width: 180px;
  max-width: 280px;
  background: var(--color-surface-elevated, var(--color-surface));
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-1);
  overflow: hidden;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
  user-select: none;
}

.context-menu-item:hover:not(.context-menu-item--disabled):not(.context-menu-item--divider) {
  background: var(--color-primary-50);
}

.context-menu-item:active:not(.context-menu-item--disabled):not(.context-menu-item--divider) {
  background: var(--color-primary-100);
}

.context-menu-item--danger {
  color: var(--color-error-600);
}

.context-menu-item--danger:hover:not(.context-menu-item--disabled) {
  background: var(--color-error-50);
}

.context-menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.context-menu-item--divider {
  height: 1px;
  padding: 0;
  margin: var(--spacing-1) 0;
  background: var(--color-border-light);
  cursor: default;
}

.item-label {
  flex: 1;
}

.item-shortcut {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: var(--font-family-mono);
}

/* Dark mode */
:root.dark .context-menu {
  background: var(--color-gray-100);
  border-color: var(--color-border);
}

/* Animation */
.context-menu-enter-active {
  animation: contextMenuIn var(--transition-fast) ease-out;
}

.context-menu-leave-active {
  animation: contextMenuOut var(--transition-fast) ease-in;
}

@keyframes contextMenuIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes contextMenuOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Mobile: Full-width at bottom */
@media (max-width: 640px) {
  .context-menu {
    position: fixed;
    top: auto !important;
    bottom: 0;
    left: 0 !important;
    right: 0;
    max-width: 100%;
    min-width: 100%;
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    padding: var(--spacing-2);
    padding-bottom: calc(var(--spacing-2) + env(safe-area-inset-bottom, 0));
  }

  .context-menu-item {
    padding: var(--spacing-4);
    min-height: 48px;
  }

  .context-menu-enter-active .context-menu {
    animation: sheetSlideIn var(--transition-base) ease-out;
  }

  .context-menu-leave-active .context-menu {
    animation: sheetSlideOut var(--transition-fast) ease-in;
  }

  @keyframes sheetSlideIn {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes sheetSlideOut {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .context-menu-enter-active,
  .context-menu-leave-active {
    animation: none;
  }
}
</style>
