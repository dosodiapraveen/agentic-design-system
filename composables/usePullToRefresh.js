/**
 * Pull-to-Refresh Composable
 *
 * Mobile-friendly pull-down gesture to trigger refresh actions.
 * Shows visual indicator while pulling and loading states.
 *
 * Usage:
 * const {
 *   pullDistance,
 *   isRefreshing,
 *   isPulling,
 *   onTouchStart,
 *   onTouchMove,
 *   onTouchEnd
 * } = usePullToRefresh({
 *   onRefresh: async () => { await fetchData() },
 *   threshold: 80,
 *   maxPull: 120
 * })
 */

import { ref, computed } from 'vue'

export function usePullToRefresh(options = {}) {
  const {
    threshold = 80,        // Pixels to pull before triggering refresh
    maxPull = 120,         // Maximum pull distance
    resistance = 0.5,      // Resistance factor after threshold
    onRefresh = null,      // Async function to call on refresh
    disabled = false       // Disable pull-to-refresh
  } = options

  // State
  const startY = ref(0)
  const currentY = ref(0)
  const pullDistance = ref(0)
  const isRefreshing = ref(false)
  const isPulling = ref(false)
  const canPull = ref(false)

  // Computed
  const pullProgress = computed(() => {
    return Math.min(pullDistance.value / threshold, 1)
  })

  const hasReachedThreshold = computed(() => {
    return pullDistance.value >= threshold
  })

  const pullStyle = computed(() => ({
    transform: `translateY(${pullDistance.value}px)`,
    transition: isPulling.value ? 'none' : 'transform 0.3s ease-out'
  }))

  const indicatorStyle = computed(() => ({
    opacity: pullProgress.value,
    transform: `translateY(${Math.min(pullDistance.value, threshold) - threshold}px) rotate(${pullProgress.value * 180}deg)`,
    transition: isPulling.value ? 'none' : 'all 0.3s ease-out'
  }))

  // Check if we're at the top of the scrollable container
  const isAtTop = (element) => {
    if (!element) return true

    // Walk up to find scrollable parent
    let el = element
    while (el && el !== document.body) {
      if (el.scrollTop > 0) return false
      el = el.parentElement
    }

    return window.scrollY <= 0
  }

  // Apply resistance when pulling past threshold
  const applyResistance = (distance) => {
    if (distance <= threshold) return distance

    const overflow = distance - threshold
    const resistedOverflow = overflow * resistance
    return Math.min(threshold + resistedOverflow, maxPull)
  }

  // Event handlers
  const onTouchStart = (event) => {
    if (disabled || isRefreshing.value) return

    const touch = event.touches[0]
    startY.value = touch.clientY
    currentY.value = touch.clientY

    // Check if we're at the top
    canPull.value = isAtTop(event.target)
  }

  const onTouchMove = (event) => {
    if (disabled || isRefreshing.value || !canPull.value) return

    const touch = event.touches[0]
    const deltaY = touch.clientY - startY.value

    // Only handle downward pulls when at top
    if (deltaY <= 0) {
      pullDistance.value = 0
      isPulling.value = false
      return
    }

    // Re-check scroll position
    if (!isAtTop(event.target)) {
      pullDistance.value = 0
      isPulling.value = false
      return
    }

    // Prevent default scroll while pulling
    event.preventDefault()

    isPulling.value = true
    currentY.value = touch.clientY
    pullDistance.value = applyResistance(deltaY)
  }

  const onTouchEnd = async () => {
    if (disabled || !isPulling.value) return

    isPulling.value = false

    if (hasReachedThreshold.value && onRefresh) {
      isRefreshing.value = true
      pullDistance.value = threshold // Hold at threshold while refreshing

      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull-to-refresh error:', error)
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    } else {
      pullDistance.value = 0
    }

    canPull.value = false
  }

  const onTouchCancel = () => {
    isPulling.value = false
    pullDistance.value = 0
    canPull.value = false
  }

  // Manual reset
  const reset = () => {
    pullDistance.value = 0
    isRefreshing.value = false
    isPulling.value = false
    canPull.value = false
  }

  // Manual trigger (for button-based refresh)
  const refresh = async () => {
    if (isRefreshing.value || !onRefresh) return

    isRefreshing.value = true
    try {
      await onRefresh()
    } finally {
      isRefreshing.value = false
    }
  }

  return {
    // State
    pullDistance,
    pullProgress,
    isRefreshing,
    isPulling,
    hasReachedThreshold,

    // Styles
    pullStyle,
    indicatorStyle,

    // Event handlers
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,

    // Methods
    reset,
    refresh
  }
}

export default usePullToRefresh
