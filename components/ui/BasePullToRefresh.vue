<template>
  <div
    class="pull-to-refresh-container"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchCancel"
  >
    <!-- Pull indicator -->
    <div
      class="pull-indicator"
      :class="{ 'pull-indicator--visible': showIndicator }"
      :style="indicatorPositionStyle"
    >
      <div
        class="pull-indicator-content"
        :class="{ 'pull-indicator--refreshing': isRefreshing }"
      >
        <BaseIcon
          v-if="isRefreshing"
          name="loader"
          :size="24"
          spin
          class="refresh-spinner"
        />
        <template v-else>
          <BaseIcon
            name="arrow-down"
            :size="24"
            class="pull-arrow"
            :style="arrowStyle"
          />
          <span class="pull-text">{{ pullText }}</span>
        </template>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="pull-content"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import BaseIcon from './BaseIcon.vue'
import { usePullToRefresh } from '../../composables/usePullToRefresh.js'
import { computed } from 'vue'

export default {
  name: 'BasePullToRefresh',
  components: { BaseIcon },
  props: {
    threshold: {
      type: Number,
      default: 80
    },
    maxPull: {
      type: Number,
      default: 120
    },
    disabled: {
      type: Boolean,
      default: false
    },
    pullText: {
      type: String,
      default: 'Pull to refresh'
    },
    releaseText: {
      type: String,
      default: 'Release to refresh'
    },
    refreshingText: {
      type: String,
      default: 'Refreshing...'
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const onRefresh = async () => {
      return new Promise((resolve) => {
        emit('refresh', resolve)
      })
    }

    const {
      pullDistance,
      pullProgress,
      isRefreshing,
      isPulling,
      hasReachedThreshold,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      refresh
    } = usePullToRefresh({
      threshold: props.threshold,
      maxPull: props.maxPull,
      onRefresh,
      disabled: props.disabled
    })

    // Show indicator when pulling or refreshing
    const showIndicator = computed(() => {
      return pullDistance.value > 0 || isRefreshing.value
    })

    // Position indicator based on pull distance
    const indicatorPositionStyle = computed(() => {
      const distance = Math.min(pullDistance.value, props.threshold)
      return {
        transform: `translateY(${distance - props.threshold}px)`,
        opacity: pullProgress.value
      }
    })

    // Move content down while pulling
    const contentStyle = computed(() => {
      return {
        transform: `translateY(${pullDistance.value}px)`,
        transition: isPulling.value ? 'none' : 'transform 0.3s ease-out'
      }
    })

    // Rotate arrow based on progress
    const arrowStyle = computed(() => {
      return {
        transform: `rotate(${hasReachedThreshold.value ? 180 : pullProgress.value * 180}deg)`,
        transition: isPulling.value ? 'none' : 'transform 0.2s ease-out'
      }
    })

    // Dynamic pull text
    const currentPullText = computed(() => {
      if (isRefreshing.value) return props.refreshingText
      if (hasReachedThreshold.value) return props.releaseText
      return props.pullText
    })

    return {
      pullDistance,
      pullProgress,
      isRefreshing,
      isPulling,
      hasReachedThreshold,
      showIndicator,
      indicatorPositionStyle,
      contentStyle,
      arrowStyle,
      pullText: currentPullText,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      refresh
    }
  }
}
</script>

<style scoped>
.pull-to-refresh-container {
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
}

/* Pull indicator */
.pull-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: var(--spacing-4);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-fast);
  z-index: 10;
}

.pull-indicator--visible {
  opacity: 1;
}

.pull-indicator-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.pull-indicator--refreshing .pull-indicator-content {
  background: var(--color-primary-50);
}

.pull-arrow {
  color: var(--color-text-tertiary);
}

.pull-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.refresh-spinner {
  color: var(--color-primary-500);
}

/* Content */
.pull-content {
  will-change: transform;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .pull-indicator,
  .pull-content,
  .pull-arrow {
    transition: none !important;
  }
}
</style>
