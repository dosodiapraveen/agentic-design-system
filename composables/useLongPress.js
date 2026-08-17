/**
 * Long Press Composable
 *
 * Detects long press gestures for context menus and secondary actions.
 * Works with both touch and mouse events.
 *
 * Usage:
 * const {
 *   onPointerDown,
 *   onPointerUp,
 *   onPointerLeave,
 *   isPressed,
 *   pressProgress
 * } = useLongPress({
 *   duration: 500,
 *   onLongPress: (event) => showContextMenu(event),
 *   onPress: () => console.log('Quick press')
 * })
 */

import { ref, computed, onUnmounted } from 'vue'

export function useLongPress(options = {}) {
  const {
    duration = 500,       // Time in ms to trigger long press
    threshold = 10,       // Movement threshold to cancel (pixels)
    onLongPress = null,   // Callback when long press triggers
    onPress = null,       // Callback for normal press (if no long press)
    onPressStart = null,  // Callback when press starts
    onPressEnd = null,    // Callback when press ends
    disabled = false
  } = options

  // State
  const isPressed = ref(false)
  const isLongPressed = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const pressStartTime = ref(0)
  const pressTimer = ref(null)
  const progressInterval = ref(null)
  const pressProgress = ref(0)

  // Computed
  const isPressing = computed(() => isPressed.value && !isLongPressed.value)

  // Clear all timers
  const clearTimers = () => {
    if (pressTimer.value) {
      clearTimeout(pressTimer.value)
      pressTimer.value = null
    }
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
  }

  // Start progress animation
  const startProgress = () => {
    const startTime = Date.now()
    progressInterval.value = setInterval(() => {
      const elapsed = Date.now() - startTime
      pressProgress.value = Math.min(elapsed / duration, 1)

      if (pressProgress.value >= 1) {
        clearInterval(progressInterval.value)
        progressInterval.value = null
      }
    }, 16) // ~60fps
  }

  // Handle press start
  const onPointerDown = (event) => {
    if (disabled) return

    // Get coordinates (handle both mouse and touch)
    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0

    isPressed.value = true
    isLongPressed.value = false
    startX.value = clientX
    startY.value = clientY
    pressStartTime.value = Date.now()
    pressProgress.value = 0

    // Start progress animation
    startProgress()

    // Notify press start
    onPressStart?.(event)

    // Set timer for long press
    pressTimer.value = setTimeout(() => {
      if (isPressed.value && !isLongPressed.value) {
        isLongPressed.value = true
        pressProgress.value = 1
        onLongPress?.(event, {
          x: clientX,
          y: clientY,
          target: event.target
        })
      }
    }, duration)
  }

  // Handle pointer movement
  const onPointerMove = (event) => {
    if (!isPressed.value || isLongPressed.value) return

    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0

    const deltaX = Math.abs(clientX - startX.value)
    const deltaY = Math.abs(clientY - startY.value)

    // Cancel if moved too much
    if (deltaX > threshold || deltaY > threshold) {
      clearTimers()
      isPressed.value = false
      pressProgress.value = 0
    }
  }

  // Handle press end
  const onPointerUp = (event) => {
    if (!isPressed.value) return

    clearTimers()

    const pressDuration = Date.now() - pressStartTime.value

    // If it was a short press (not long press), trigger normal press
    if (!isLongPressed.value && pressDuration < duration && onPress) {
      onPress(event)
    }

    // Notify press end
    onPressEnd?.(event, {
      duration: pressDuration,
      wasLongPress: isLongPressed.value
    })

    isPressed.value = false
    isLongPressed.value = false
    pressProgress.value = 0
  }

  // Handle pointer leaving element
  const onPointerLeave = () => {
    if (isPressed.value && !isLongPressed.value) {
      clearTimers()
      isPressed.value = false
      pressProgress.value = 0
    }
  }

  // Handle touch cancel
  const onPointerCancel = () => {
    clearTimers()
    isPressed.value = false
    isLongPressed.value = false
    pressProgress.value = 0
  }

  // Handle context menu (right-click on desktop)
  const onContextMenu = (event) => {
    if (disabled) return

    // Prevent default context menu
    event.preventDefault()

    // Trigger long press handler
    onLongPress?.(event, {
      x: event.clientX,
      y: event.clientY,
      target: event.target
    })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    clearTimers()
  })

  return {
    // Event handlers
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onContextMenu,

    // State
    isPressed,
    isLongPressed,
    isPressing,
    pressProgress,

    // For touch events specifically
    handlers: {
      onTouchStart: onPointerDown,
      onTouchMove: onPointerMove,
      onTouchEnd: onPointerUp,
      onTouchCancel: onPointerCancel,
      onMouseDown: onPointerDown,
      onMouseMove: onPointerMove,
      onMouseUp: onPointerUp,
      onMouseLeave: onPointerLeave,
      onContextMenu
    }
  }
}

export default useLongPress
