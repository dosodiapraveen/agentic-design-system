<template>
  <div :class="['collapsible-card', { 'collapsible-card--collapsed': !isExpanded }]">
    <button
      type="button"
      class="collapsible-header"
      :aria-expanded="isExpanded"
      :aria-controls="contentId"
      @click="toggle"
    >
      <slot name="header">
        <div class="header-content">
          <div v-if="icon || $slots.icon" class="header-icon">
            <slot name="icon">
              <BaseIcon :name="icon" :size="iconSize" />
            </slot>
          </div>
          <div class="header-text">
            <span class="header-title">{{ title }}</span>
            <span v-if="subtitle" class="header-subtitle">{{ subtitle }}</span>
          </div>
          <div v-if="badge" class="header-badge">
            <BaseBadge :label="badge" :variant="badgeVariant" size="sm" />
          </div>
        </div>
      </slot>
      <div class="header-chevron">
        <BaseIcon
          name="chevron-down"
          :size="20"
          :class="{ 'chevron-rotated': isExpanded }"
        />
      </div>
    </button>

    <Transition name="collapse">
      <div
        v-show="isExpanded"
        :id="contentId"
        class="collapsible-content"
        :style="contentStyle"
      >
        <div ref="contentInner" class="collapsible-content-inner">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'
import BaseBadge from './BaseBadge.vue'

let cardIdCounter = 0

export default {
  name: 'BaseCollapsibleCard',
  components: { BaseIcon, BaseBadge },
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    iconSize: {
      type: Number,
      default: 24
    },
    badge: {
      type: [String, Number],
      default: null
    },
    badgeVariant: {
      type: String,
      default: 'primary'
    },
    defaultExpanded: {
      type: Boolean,
      default: true
    },
    // For controlled mode
    modelValue: {
      type: Boolean,
      default: undefined
    },
    // Persist state to localStorage
    persistKey: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue', 'toggle'],
  data() {
    return {
      contentId: `collapsible-content-${++cardIdCounter}`,
      localExpanded: this.defaultExpanded,
      contentHeight: null
    }
  },
  computed: {
    isExpanded() {
      // Controlled mode
      if (this.modelValue !== undefined) {
        return this.modelValue
      }
      return this.localExpanded
    },

    contentStyle() {
      if (this.contentHeight !== null) {
        return { maxHeight: `${this.contentHeight}px` }
      }
      return {}
    }
  },
  watch: {
    isExpanded(val) {
      // Update content height for animation
      this.updateContentHeight()

      // Persist state if key provided
      if (this.persistKey) {
        localStorage.setItem(`collapsible-${this.persistKey}`, JSON.stringify(val))
      }
    }
  },
  mounted() {
    // Restore persisted state
    if (this.persistKey) {
      const savedState = localStorage.getItem(`collapsible-${this.persistKey}`)
      if (savedState !== null) {
        this.localExpanded = JSON.parse(savedState)
        this.$emit('update:modelValue', this.localExpanded)
      }
    }

    // Set initial content height
    this.updateContentHeight()
  },
  methods: {
    toggle() {
      const newValue = !this.isExpanded

      if (this.modelValue !== undefined) {
        this.$emit('update:modelValue', newValue)
      } else {
        this.localExpanded = newValue
      }

      this.$emit('toggle', newValue)
    },

    expand() {
      if (!this.isExpanded) {
        this.toggle()
      }
    },

    collapse() {
      if (this.isExpanded) {
        this.toggle()
      }
    },

    updateContentHeight() {
      this.$nextTick(() => {
        if (this.$refs.contentInner) {
          this.contentHeight = this.$refs.contentInner.scrollHeight
        }
      })
    }
  }
}
</script>

<style scoped>
.collapsible-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
}

.collapsible-card:hover {
  box-shadow: var(--shadow-sm);
}

.collapsible-card--collapsed {
  /* Collapsed state styles if needed */
}

/* Header */
.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-4);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
  min-height: 56px;
}

.collapsible-header:hover {
  background: var(--color-surface-hover);
}

.collapsible-header:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: -2px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-50);
  color: var(--color-primary-500);
  flex-shrink: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.header-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-badge {
  flex-shrink: 0;
}

.header-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  margin-left: var(--spacing-2);
}

.header-chevron svg {
  transition: transform var(--transition-base);
}

.chevron-rotated {
  transform: rotate(180deg);
}

/* Content */
.collapsible-content {
  overflow: hidden;
  transition: max-height var(--transition-slow) ease-out;
}

.collapsible-content-inner {
  padding: 0 var(--spacing-4) var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}

/* Collapse animation */
.collapse-enter-active {
  transition: max-height var(--transition-slow) ease-out,
              opacity var(--transition-base) ease-out;
}

.collapse-leave-active {
  transition: max-height var(--transition-base) ease-in,
              opacity var(--transition-fast) ease-in;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0 !important;
  opacity: 0;
}

/* Mobile touch optimization */
@media (max-width: 640px) {
  .collapsible-header {
    padding: var(--spacing-3);
    min-height: 60px;
  }

  .header-content {
    gap: var(--spacing-2);
  }

  .header-icon {
    width: 36px;
    height: 36px;
  }

  .collapsible-content-inner {
    padding: 0 var(--spacing-3) var(--spacing-3);
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .collapsible-content,
  .header-chevron svg {
    transition: none;
  }

  .collapse-enter-active,
  .collapse-leave-active {
    transition: none;
  }
}
</style>
