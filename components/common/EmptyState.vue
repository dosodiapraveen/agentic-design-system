<template>
  <div :class="['empty-state', { 'empty-state--compact': compact }]">
    <div class="empty-illustration">
      <div :class="['empty-icon-wrapper', `empty-icon--${variant}`]">
        <span class="empty-icon">{{ icon }}</span>
      </div>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-message">{{ message }}</p>
    <button v-if="actionText" @click="$emit('action')" class="empty-action">
      {{ actionText }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📭'
    },
    title: {
      type: String,
      default: 'Nothing here yet'
    },
    message: {
      type: String,
      default: 'Get started by creating your first item.'
    },
    actionText: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default',
      validator: (v) => ['default', 'primary', 'success', 'warning', 'error', 'info'].includes(v)
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  emits: ['action']
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--spacing-12) var(--spacing-6);
}

.empty-state--compact {
  padding: var(--spacing-6) var(--spacing-4);
}

.empty-illustration {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-4);
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--color-gray-100);
}

.empty-state--compact .empty-icon-wrapper {
  width: 56px;
  height: 56px;
}

/* Variant backgrounds */
.empty-icon--primary {
  background: var(--color-primary-100);
}

.empty-icon--success {
  background: var(--color-success-100);
}

.empty-icon--warning {
  background: var(--color-warning-100);
}

.empty-icon--error {
  background: var(--color-error-100);
}

.empty-icon--info {
  background: var(--color-info-100);
}

.empty-icon {
  font-size: 40px;
  line-height: 1;
}

.empty-state--compact .empty-icon {
  font-size: 28px;
}

.empty-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.empty-state--compact .empty-title {
  font-size: var(--font-size-md);
}

.empty-message {
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state--compact .empty-message {
  font-size: var(--font-size-xs);
  margin-bottom: var(--spacing-4);
}

.empty-action {
  padding: var(--spacing-3) var(--spacing-6);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-inverse);
  background: var(--color-primary-500);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.empty-action:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

.empty-action:active {
  transform: translateY(0);
}

.empty-action:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.empty-state--compact .empty-action {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
}

@media (max-width: 640px) {
  .empty-state {
    padding: var(--spacing-8) var(--spacing-5);
  }

  .empty-icon-wrapper {
    width: 64px;
    height: 64px;
  }

  .empty-icon {
    font-size: 32px;
  }

  .empty-title {
    font-size: var(--font-size-md);
  }
}
</style>
