/**
 * Swipe Gesture Composable
 *
 * Handles touch/pointer-based swipe gestures for swipe-to-delete functionality.
 * Works on both touch devices and desktop (with mouse drag).
 *
 * Usage:
 * const { onPointerDown, onPointerMove, onPointerUp, offsetX, isSwiping } = useSwipeGesture({
 *   threshold: 80,
 *   onSwipeLeft: () => console.log('Swiped left!'),
 *   onSwipeRight: () => console.log('Swiped right!'),
 *   onSwipeEnd: () => console.log('Swipe ended'),
 * })
 */

import { ref, computed } from 'vue'

export function useSwipeGesture(options = {}) {
  const {
    threshold = 80,           // Pixels to swipe before triggering action
    maxOffset = 100,          // Maximum swipe distance
    direction = 'left',       // 'left', 'right', or 'both'
    elasticity = 0.3,         // Resistance after hitting max (0-1)
    snapBack = true,          // Snap back when released before threshold
    keepOpenOnThreshold = false, // Keep item open (don't snap back) when threshold is reached
    onSwipeLeft = null,
    onSwipeRight = null,
    onSwipeEnd = null,
  } = options

  // State
  const startX = ref(0)
  const startY = ref(0)
  const currentX = ref(0)
  const offsetX = ref(0)
  const isSwiping = ref(false)
  const isActive = ref(false)
  const hasPassedThreshold = ref(false)

  // Computed
  const swipeProgress = computed(() => {
    return Math.min(Math.abs(offsetX.value) / threshold, 1)
  })

  const swipeDirection = computed(() => {
    if (offsetX.value < -10) return 'left'
    if (offsetX.value > 10) return 'right'
    return null
  })

  // Apply elastic resistance when past max offset
  const applyElasticity = (offset) => {
    const absOffset = Math.abs(offset)
    const sign = offset < 0 ? -1 : 1

    if (absOffset <= maxOffset) {
      return offset
    }

    const overflow = absOffset - maxOffset
    const elasticOverflow = overflow * elasticity
    return sign * (maxOffset + elasticOverflow)
  }

  // Check if swipe direction is allowed
  const isDirectionAllowed = (offset) => {
    if (direction === 'both') return true
    if (direction === 'left' && offset < 0) return true
    if (direction === 'right' && offset > 0) return true
    return false
  }

  // Event handlers
  const onPointerDown = (event) => {
    // Only handle primary button (left click / touch)
    if (event.button !== undefined && event.button !== 0) return

    isActive.value = true
    isSwiping.value = false
    hasPassedThreshold.value = false
    startX.value = event.clientX || event.touches?.[0]?.clientX || 0
    startY.value = event.clientY || event.touches?.[0]?.clientY || 0
    currentX.value = startX.value
  }

  const onPointerMove = (event) => {
    if (!isActive.value) return

    const clientX = event.clientX || event.touches?.[0]?.clientX || 0
    const clientY = event.clientY || event.touches?.[0]?.clientY || 0

    const deltaX = clientX - startX.value
    const deltaY = clientY - startY.value

    // Only start swiping if horizontal movement is greater than vertical
    // This prevents interference with scrolling
    if (!isSwiping.value) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isSwiping.value = true
        // Prevent scrolling while swiping
        event.preventDefault?.()
      } else if (Math.abs(deltaY) > 10) {
        // User is scrolling vertically, cancel swipe detection
        isActive.value = false
        return
      }
    }

    if (isSwiping.value) {
      event.preventDefault?.()
      currentX.value = clientX

      let rawOffset = deltaX

      // Check direction constraint
      if (!isDirectionAllowed(rawOffset)) {
        rawOffset = 0
      }

      // Apply elasticity
      offsetX.value = applyElasticity(rawOffset)

      // Track if threshold passed
      if (Math.abs(offsetX.value) >= threshold) {
        hasPassedThreshold.value = true
      }
    }
  }

  const onPointerUp = () => {
    if (!isActive.value) return

    const wasSwipingLeft = offsetX.value < -threshold
    const wasSwipingRight = offsetX.value > threshold
    const passedThreshold = wasSwipingLeft || wasSwipingRight

    if (wasSwipingLeft && onSwipeLeft) {
      onSwipeLeft()
    } else if (wasSwipingRight && onSwipeRight) {
      onSwipeRight()
    }

    // Notify swipe end
    if (onSwipeEnd && isSwiping.value) {
      onSwipeEnd({
        direction: swipeDirection.value,
        passedThreshold: hasPassedThreshold.value,
        offset: offsetX.value
      })
    }

    // Keep open if threshold passed and keepOpenOnThreshold is true
    if (keepOpenOnThreshold && passedThreshold) {
      // Snap to the max offset position
      if (wasSwipingLeft) {
        offsetX.value = -maxOffset
      } else if (wasSwipingRight) {
        offsetX.value = maxOffset
      }
    } else if (snapBack || !passedThreshold) {
      // Reset state (animation handled by CSS transition)
      offsetX.value = 0
    }

    isActive.value = false
    isSwiping.value = false
    // Don't reset hasPassedThreshold if keeping open
    if (!keepOpenOnThreshold || !passedThreshold) {
      hasPassedThreshold.value = false
    }
  }

  const onPointerCancel = () => {
    offsetX.value = 0
    isActive.value = false
    isSwiping.value = false
    hasPassedThreshold.value = false
  }

  // Manual reset (for programmatic control)
  const reset = () => {
    offsetX.value = 0
    isActive.value = false
    isSwiping.value = false
    hasPassedThreshold.value = false
  }

  // Keep item swiped open (don't snap back)
  const keepOpen = () => {
    if (direction === 'left') {
      offsetX.value = -maxOffset
    } else if (direction === 'right') {
      offsetX.value = maxOffset
    }
  }

  return {
    // Event handlers (attach to element)
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,

    // State
    offsetX,
    isSwiping,
    isActive,
    hasPassedThreshold,
    swipeProgress,
    swipeDirection,

    // Methods
    reset,
    keepOpen,
  }
}

export default useSwipeGesture
