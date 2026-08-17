/**
 * Swipe Navigation Composable
 *
 * Enables horizontal swipe gestures for tab/page navigation.
 * Commonly used for switching between tabs or pages on mobile.
 *
 * Usage:
 * const {
 *   onTouchStart,
 *   onTouchMove,
 *   onTouchEnd,
 *   swipeOffset,
 *   isNavigating
 * } = useSwipeNavigation({
 *   onSwipeLeft: () => nextTab(),
 *   onSwipeRight: () => prevTab(),
 *   threshold: 50
 * })
 */

import { ref, computed } from 'vue'

export function useSwipeNavigation(options = {}) {
  const {
    threshold = 50,        // Pixels to swipe before triggering navigation
    velocityThreshold = 0.3, // Minimum velocity to trigger (pixels/ms)
    maxOffset = 100,       // Maximum visual offset
    resistance = 0.3,      // Resistance factor at edges
    onSwipeLeft = null,    // Go to next item
    onSwipeRight = null,   // Go to previous item
    canSwipeLeft = true,   // Can navigate left (to next)
    canSwipeRight = true,  // Can navigate right (to previous)
    disabled = false
  } = options

  // State
  const startX = ref(0)
  const startY = ref(0)
  const startTime = ref(0)
  const currentX = ref(0)
  const swipeOffset = ref(0)
  const isSwiping = ref(false)
  const isNavigating = ref(false)
  const swipeDirection = ref(null) // 'left' | 'right' | null

  // Computed
  const swipeProgress = computed(() => {
    return Math.min(Math.abs(swipeOffset.value) / threshold, 1)
  })

  const containerStyle = computed(() => ({
    transform: `translateX(${swipeOffset.value}px)`,
    transition: isSwiping.value ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }))

  // Apply resistance at edges
  const applyResistance = (offset, canMove) => {
    if (!canMove) {
      // Strong resistance when can't navigate in this direction
      return offset * resistance * 0.5
    }

    const absOffset = Math.abs(offset)
    const sign = offset < 0 ? -1 : 1

    if (absOffset <= maxOffset) {
      return offset
    }

    const overflow = absOffset - maxOffset
    const resistedOverflow = overflow * resistance
    return sign * (maxOffset + resistedOverflow)
  }

  // Calculate swipe velocity
  const calculateVelocity = (endX, endTime) => {
    const distance = endX - startX.value
    const time = endTime - startTime.value
    return time > 0 ? Math.abs(distance / time) : 0
  }

  // Event handlers
  const onTouchStart = (event) => {
    if (disabled || isNavigating.value) return

    const touch = event.touches[0]
    startX.value = touch.clientX
    startY.value = touch.clientY
    startTime.value = Date.now()
    currentX.value = touch.clientX
    isSwiping.value = false
    swipeDirection.value = null
  }

  const onTouchMove = (event) => {
    if (disabled || isNavigating.value) return
    if (!startX.value) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - startX.value
    const deltaY = touch.clientY - startY.value

    // Determine swipe direction on first significant movement
    if (!isSwiping.value) {
      // Only start horizontal swipe if more horizontal than vertical
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isSwiping.value = true
        swipeDirection.value = deltaX < 0 ? 'left' : 'right'
      } else if (Math.abs(deltaY) > 10) {
        // User is scrolling vertically
        return
      }
    }

    if (isSwiping.value) {
      event.preventDefault()
      currentX.value = touch.clientX

      // Apply resistance based on whether we can navigate
      const canMoveInDirection = deltaX < 0 ? canSwipeLeft : canSwipeRight
      swipeOffset.value = applyResistance(deltaX, canMoveInDirection)
    }
  }

  const onTouchEnd = (event) => {
    if (disabled || !isSwiping.value) {
      reset()
      return
    }

    const endTime = Date.now()
    const velocity = calculateVelocity(currentX.value, endTime)
    const offset = swipeOffset.value

    // Check if should trigger navigation
    const hasEnoughDistance = Math.abs(offset) >= threshold
    const hasEnoughVelocity = velocity >= velocityThreshold

    if (hasEnoughDistance || hasEnoughVelocity) {
      if (offset < 0 && canSwipeLeft && onSwipeLeft) {
        // Swiped left - go to next
        isNavigating.value = true
        swipeOffset.value = -maxOffset // Animate out

        setTimeout(() => {
          onSwipeLeft()
          reset()
        }, 150)
        return
      } else if (offset > 0 && canSwipeRight && onSwipeRight) {
        // Swiped right - go to previous
        isNavigating.value = true
        swipeOffset.value = maxOffset // Animate out

        setTimeout(() => {
          onSwipeRight()
          reset()
        }, 150)
        return
      }
    }

    // Snap back
    swipeOffset.value = 0
    isSwiping.value = false
  }

  const onTouchCancel = () => {
    reset()
  }

  // Reset all state
  const reset = () => {
    swipeOffset.value = 0
    isSwiping.value = false
    isNavigating.value = false
    swipeDirection.value = null
    startX.value = 0
    startY.value = 0
    startTime.value = 0
    currentX.value = 0
  }

  return {
    // Event handlers
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,

    // State
    swipeOffset,
    swipeProgress,
    isSwiping,
    isNavigating,
    swipeDirection,

    // Styles
    containerStyle,

    // Methods
    reset
  }
}

export default useSwipeNavigation
