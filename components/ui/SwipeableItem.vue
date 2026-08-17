<template>
  <div
    class="swipeable-item"
    :class="{
      'is-swiping': isSwiping,
      'is-open': isOpen,
      'passed-threshold': hasPassedThreshold
    }"
    @touchstart.passive="handlePointerDown"
    @touchmove="handlePointerMove"
    @touchend="handlePointerUp"
    @touchcancel="handlePointerCancel"
    @mousedown="handlePointerDown"
    @mousemove="handlePointerMove"
    @mouseup="handlePointerUp"
    @mouseleave="handlePointerUp"
  >
    <!-- Background action (revealed on swipe) -->
    <div
      class="swipeable-action"
      :class="[`action-${actionVariant}`, { visible: Math.abs(offsetX) > 10 }]"
      :style="actionStyle"
      @click="handleActionClick"
    >
      <div class="action-content">
        <BaseIcon v-if="actionIcon" :name="actionIcon" :size="20" />
        <span v-if="actionLabel && Math.abs(offsetX) > 50" class="action-label">
          {{ actionLabel }}
        </span>
      </div>
    </div>

    <!-- Main content (slides on swipe) -->
    <div
      class="swipeable-content"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useSwipeGesture } from '@design-system/composables/useSwipeGesture'
import BaseIcon from './BaseIcon.vue'

export default {
  name: 'SwipeableItem',
  components: { BaseIcon },
  props: {
    // Action configuration
    actionIcon: {
      type: String,
      default: 'trash'
    },
    actionLabel: {
      type: String,
      default: 'Delete'
    },
    actionVariant: {
      type: String,
      default: 'danger',
      validator: (v) => ['danger', 'warning', 'primary', 'success'].includes(v)
    },
    // Behavior
    threshold: {
      type: Number,
      default: 80
    },
    maxOffset: {
      type: Number,
      default: 100
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // Keep open after threshold reached (vs auto-trigger)
    keepOpenOnThreshold: {
      type: Boolean,
      default: false
    }
  },
  emits: ['action', 'swipe-start', 'swipe-end'],
  setup(props, { emit }) {
    const isOpen = ref(false)

    const handleSwipeLeft = () => {
      if (props.keepOpenOnThreshold) {
        isOpen.value = true
      } else {
        emit('action')
      }
    }

    const handleSwipeEnd = (data) => {
      emit('swipe-end', data)
      if (!data.passedThreshold) {
        isOpen.value = false
      }
    }

    // Handle right swipe to close when item is open
    const handleSwipeRight = () => {
      if (isOpen.value) {
        isOpen.value = false
      }
    }

    const {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      offsetX,
      isSwiping,
      hasPassedThreshold,
      swipeProgress,
      reset
    } = useSwipeGesture({
      threshold: props.threshold,
      maxOffset: props.maxOffset,
      direction: 'both', // Allow both directions so user can swipe right to close
      keepOpenOnThreshold: props.keepOpenOnThreshold,
      onSwipeLeft: handleSwipeLeft,
      onSwipeRight: handleSwipeRight,
      onSwipeEnd: handleSwipeEnd,
    })

    // Content transform style
    const contentStyle = computed(() => {
      if (props.disabled) return {}
      return {
        transform: `translateX(${offsetX.value}px)`,
        transition: isSwiping.value ? 'none' : 'transform var(--transition-base)'
      }
    })

    // Action background style
    const actionStyle = computed(() => {
      const absOffset = Math.abs(offsetX.value)
      const opacity = Math.min(absOffset / 50, 1)
      const scale = 0.8 + (swipeProgress.value * 0.2)

      return {
        opacity,
        '--action-scale': scale
      }
    })

    // Wrap handlers to check disabled state
    const handlePointerDown = (e) => {
      if (props.disabled) return
      emit('swipe-start')
      onPointerDown(e)
    }

    const handlePointerMove = (e) => {
      if (props.disabled) return
      onPointerMove(e)
    }

    const handlePointerUp = (e) => {
      if (props.disabled) return
      onPointerUp(e)
    }

    const handlePointerCancel = () => {
      if (props.disabled) return
      onPointerCancel()
    }

    const handleActionClick = () => {
      emit('action')
      reset()
      isOpen.value = false
    }

    // Public method to close
    const close = () => {
      reset()
      isOpen.value = false
    }

    // Watch for external close triggers
    watch(() => props.disabled, (disabled) => {
      if (disabled) {
        close()
      }
    })

    return {
      offsetX,
      isSwiping,
      isOpen,
      hasPassedThreshold,
      contentStyle,
      actionStyle,
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
      handleActionClick,
      close
    }
  }
}
</script>

<style scoped>
.swipeable-item {
  position: relative;
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
  user-select: none;
}

.swipeable-content {
  position: relative;
  z-index: 2;
  background: var(--color-surface);
  will-change: transform;
}

.swipeable-action {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.swipeable-action.visible {
  opacity: 1;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
  transform: scale(var(--action-scale, 0.8));
  transition: transform var(--transition-fast);
  color: var(--color-text-inverse);
}

.action-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Action variants */
.action-danger {
  background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
}

.action-warning {
  background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600));
}

.action-primary {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
}

.action-success {
  background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
}

/* States */
.swipeable-item.is-swiping .swipeable-content {
  cursor: grabbing;
}

.swipeable-item.passed-threshold .action-content {
  transform: scale(1.1);
}

/* Haptic feedback hint */
.swipeable-item.passed-threshold .swipeable-action {
  animation: pulse-action 200ms ease-out;
}

@keyframes pulse-action {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
  100% { filter: brightness(1); }
}

/* Reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  .swipeable-content {
    transition: none !important;
  }

  .swipeable-action,
  .action-content {
    transition: none !important;
    animation: none !important;
  }
}

/* Desktop hover hint */
@media (hover: hover) and (pointer: fine) {
  .swipeable-item:not(.is-swiping):hover .swipeable-content {
    cursor: grab;
  }
}
</style>
