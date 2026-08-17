/**
 * Haptic Feedback Composable
 *
 * Provides tactile feedback using the Vibration API.
 * Gracefully degrades on unsupported devices.
 *
 * Usage:
 * const { vibrate, vibrateSuccess, vibrateError, isSupported } = useHaptics()
 *
 * // Trigger feedback
 * vibrateSuccess() // Quick double-tap feel
 * vibrateError()   // Longer error buzz
 * vibrate(50)      // Custom duration
 */

import { ref, readonly } from 'vue'

// Check if Vibration API is supported
const checkSupport = () => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

export function useHaptics(options = {}) {
  const {
    enabled = true,      // Global enable/disable
    respectReducedMotion = true  // Respect prefers-reduced-motion
  } = options

  const isSupported = ref(checkSupport())
  const isEnabled = ref(enabled)

  // Check if user prefers reduced motion
  const prefersReducedMotion = () => {
    if (!respectReducedMotion) return false
    return typeof window !== 'undefined' &&
           window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }

  // Check if haptics should fire
  const shouldVibrate = () => {
    return isSupported.value && isEnabled.value && !prefersReducedMotion()
  }

  /**
   * Trigger a custom vibration pattern
   * @param {number|number[]} pattern - Duration in ms or array of [vibrate, pause, vibrate...]
   */
  const vibrate = (pattern = 10) => {
    if (!shouldVibrate()) return false

    try {
      return navigator.vibrate(pattern)
    } catch (e) {
      console.warn('Haptic feedback failed:', e)
      return false
    }
  }

  /**
   * Cancel any ongoing vibration
   */
  const cancel = () => {
    if (isSupported.value) {
      navigator.vibrate(0)
    }
  }

  // Preset patterns for common interactions
  const patterns = {
    // Light tap - button press, toggle
    light: 10,

    // Medium tap - selection, confirmation
    medium: 25,

    // Heavy tap - important action
    heavy: 50,

    // Success - double tap
    success: [15, 50, 15],

    // Warning - attention-getting
    warning: [30, 30, 30],

    // Error - longer buzz
    error: [50, 30, 50],

    // Notification - distinctive pattern
    notification: [15, 30, 15, 30, 30],

    // Selection changed
    selection: 8,

    // Impact - like dropping something
    impact: [10, 20, 40],

    // Swipe threshold reached
    swipeThreshold: 12,

    // Delete action
    delete: [20, 40, 60]
  }

  // Convenience methods for common patterns
  const vibrateLight = () => vibrate(patterns.light)
  const vibrateMedium = () => vibrate(patterns.medium)
  const vibrateHeavy = () => vibrate(patterns.heavy)
  const vibrateSuccess = () => vibrate(patterns.success)
  const vibrateWarning = () => vibrate(patterns.warning)
  const vibrateError = () => vibrate(patterns.error)
  const vibrateNotification = () => vibrate(patterns.notification)
  const vibrateSelection = () => vibrate(patterns.selection)
  const vibrateImpact = () => vibrate(patterns.impact)
  const vibrateSwipeThreshold = () => vibrate(patterns.swipeThreshold)
  const vibrateDelete = () => vibrate(patterns.delete)

  // Enable/disable haptics
  const enable = () => { isEnabled.value = true }
  const disable = () => { isEnabled.value = false }
  const toggle = () => { isEnabled.value = !isEnabled.value }

  return {
    // State
    isSupported: readonly(isSupported),
    isEnabled: readonly(isEnabled),
    patterns,

    // Core methods
    vibrate,
    cancel,

    // Preset methods
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
    vibrateSuccess,
    vibrateWarning,
    vibrateError,
    vibrateNotification,
    vibrateSelection,
    vibrateImpact,
    vibrateSwipeThreshold,
    vibrateDelete,

    // Control
    enable,
    disable,
    toggle
  }
}

export default useHaptics
