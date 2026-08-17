<template>
  <Transition name="offline-banner">
    <div
      v-if="showBanner"
      :class="[
        'offline-indicator',
        `offline-indicator--${status}`,
        `offline-indicator--${position}`
      ]"
      role="status"
      :aria-live="status === 'offline' ? 'assertive' : 'polite'"
    >
      <div class="offline-content">
        <div class="offline-icon">
          <BaseIcon :name="iconName" :size="18" :spin="isConnecting" />
        </div>
        <span class="offline-message">{{ message }}</span>
        <span v-if="pendingCount > 0" class="offline-pending">
          {{ pendingCount }} pending
        </span>
      </div>

      <button
        v-if="dismissible && status !== 'connecting'"
        type="button"
        class="offline-dismiss"
        aria-label="Dismiss"
        @click="dismiss"
      >
        <BaseIcon name="x" :size="16" />
      </button>
    </div>
  </Transition>
</template>

<script>
import BaseIcon from './BaseIcon.vue'
import { useOnlineStatus } from '../../composables/useOnlineStatus.js'
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'BaseOfflineIndicator',
  components: { BaseIcon },
  props: {
    position: {
      type: String,
      default: 'top',
      validator: v => ['top', 'bottom'].includes(v)
    },
    dismissible: {
      type: Boolean,
      default: true
    },
    autoDismissDelay: {
      type: Number,
      default: 3000 // Auto-dismiss "Back online" after 3s
    },
    showPendingCount: {
      type: Boolean,
      default: true
    }
  },
  emits: ['online', 'offline'],
  setup(props, { emit }) {
    const dismissed = ref(false)
    const wasOffline = ref(false)
    const isConnecting = ref(false)
    const autoDismissTimer = ref(null)

    const { isOnline, isOffline, pendingActionsCount } = useOnlineStatus({
      onOnline: () => {
        emit('online')
        isConnecting.value = false

        // Show "back online" briefly, then auto-dismiss
        if (wasOffline.value && props.autoDismissDelay > 0) {
          autoDismissTimer.value = setTimeout(() => {
            dismissed.value = true
          }, props.autoDismissDelay)
        }
      },
      onOffline: () => {
        emit('offline')
        wasOffline.value = true
        dismissed.value = false
        isConnecting.value = false

        // Clear any pending auto-dismiss
        if (autoDismissTimer.value) {
          clearTimeout(autoDismissTimer.value)
        }
      }
    })

    // Compute current status
    const status = computed(() => {
      if (isConnecting.value) return 'connecting'
      if (isOffline.value) return 'offline'
      if (wasOffline.value && !dismissed.value) return 'online'
      return 'hidden'
    })

    // Determine icon
    const iconName = computed(() => {
      if (status.value === 'connecting') return 'loader'
      if (status.value === 'offline') return 'wifi-off'
      if (status.value === 'online') return 'wifi'
      return 'wifi'
    })

    // Determine message
    const message = computed(() => {
      if (status.value === 'connecting') return 'Reconnecting...'
      if (status.value === 'offline') return 'You are offline'
      if (status.value === 'online') return 'Back online'
      return ''
    })

    // Show banner logic
    const showBanner = computed(() => {
      return status.value === 'offline' ||
             status.value === 'connecting' ||
             (status.value === 'online' && !dismissed.value)
    })

    // Pending actions count
    const pendingCount = computed(() => {
      return props.showPendingCount ? pendingActionsCount.value : 0
    })

    // Dismiss handler
    const dismiss = () => {
      dismissed.value = true
    }

    // Reset dismissed state when going offline again
    watch(isOffline, (offline) => {
      if (offline) {
        dismissed.value = false
      }
    })

    return {
      status,
      showBanner,
      iconName,
      message,
      pendingCount,
      isConnecting,
      dismiss
    }
  }
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast, 700);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-lg);
  max-width: calc(100vw - var(--spacing-8));
}

/* Positions */
.offline-indicator--top {
  top: var(--spacing-4);
}

.offline-indicator--bottom {
  bottom: calc(var(--spacing-4) + env(safe-area-inset-bottom, 0));
}

/* Status variants */
.offline-indicator--offline {
  background: var(--color-error-500);
  color: var(--color-text-inverse);
}

.offline-indicator--connecting {
  background: var(--color-warning-500);
  color: var(--color-text-inverse);
}

.offline-indicator--online {
  background: var(--color-success-500);
  color: var(--color-text-inverse);
}

.offline-indicator--hidden {
  display: none;
}

/* Content */
.offline-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.offline-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.offline-message {
  white-space: nowrap;
}

.offline-pending {
  padding: var(--spacing-1) var(--spacing-2);
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.offline-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--radius-sm);
  color: inherit;
  cursor: pointer;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.offline-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Animation */
.offline-banner-enter-active {
  animation: bannerIn var(--transition-base) ease-out;
}

.offline-banner-leave-active {
  animation: bannerOut var(--transition-fast) ease-in;
}

.offline-indicator--top.offline-banner-enter-active {
  animation-name: bannerInTop;
}

.offline-indicator--top.offline-banner-leave-active {
  animation-name: bannerOutTop;
}

.offline-indicator--bottom.offline-banner-enter-active {
  animation-name: bannerInBottom;
}

.offline-indicator--bottom.offline-banner-leave-active {
  animation-name: bannerOutBottom;
}

@keyframes bannerInTop {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes bannerOutTop {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}

@keyframes bannerInBottom {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes bannerOutBottom {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .offline-indicator {
    left: var(--spacing-4);
    right: var(--spacing-4);
    transform: none;
    max-width: none;
  }

  .offline-indicator--top {
    top: var(--spacing-3);
    border-radius: var(--radius-lg);
  }

  .offline-indicator--bottom {
    bottom: calc(var(--spacing-3) + env(safe-area-inset-bottom, 0) + 60px);
  }

  @keyframes bannerInTop {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bannerOutTop {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }

  @keyframes bannerInBottom {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bannerOutBottom {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .offline-banner-enter-active,
  .offline-banner-leave-active {
    animation: none;
  }
}
</style>
