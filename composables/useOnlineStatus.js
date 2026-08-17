/**
 * Online Status Composable
 *
 * Tracks network connectivity and provides offline detection.
 * Includes action queuing for offline support.
 *
 * Usage:
 * const {
 *   isOnline,
 *   isOffline,
 *   connectionType,
 *   queueAction,
 *   processQueue
 * } = useOnlineStatus({
 *   onOnline: () => console.log('Back online!'),
 *   onOffline: () => console.log('Gone offline')
 * })
 */

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'

export function useOnlineStatus(options = {}) {
  const {
    onOnline = null,      // Callback when connection restored
    onOffline = null,     // Callback when connection lost
    checkUrl = null,      // URL to ping for connectivity check
    checkInterval = 30000, // Interval to check connectivity (ms)
    autoProcess = true    // Auto-process queue when back online
  } = options

  // State
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const lastOnlineAt = ref(Date.now())
  const lastOfflineAt = ref(null)
  const connectionType = ref(null)
  const effectiveType = ref(null)
  const downlink = ref(null)
  const actionQueue = ref([])
  const isProcessingQueue = ref(false)
  const checkTimer = ref(null)

  // Computed
  const isOffline = computed(() => !isOnline.value)

  const offlineDuration = computed(() => {
    if (!lastOfflineAt.value || isOnline.value) return 0
    return Date.now() - lastOfflineAt.value
  })

  const pendingActionsCount = computed(() => actionQueue.value.length)

  const connectionQuality = computed(() => {
    if (!isOnline.value) return 'offline'
    if (!effectiveType.value) return 'unknown'

    const type = effectiveType.value
    if (type === '4g') return 'excellent'
    if (type === '3g') return 'good'
    if (type === '2g') return 'poor'
    return 'slow'
  })

  // Update connection info
  const updateConnectionInfo = () => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = navigator.connection
      connectionType.value = conn.type || null
      effectiveType.value = conn.effectiveType || null
      downlink.value = conn.downlink || null
    }
  }

  // Handle online event
  const handleOnline = () => {
    const wasOffline = !isOnline.value
    isOnline.value = true
    lastOnlineAt.value = Date.now()
    updateConnectionInfo()

    if (wasOffline) {
      onOnline?.()

      // Auto-process queued actions
      if (autoProcess && actionQueue.value.length > 0) {
        processQueue()
      }
    }
  }

  // Handle offline event
  const handleOffline = () => {
    const wasOnline = isOnline.value
    isOnline.value = false
    lastOfflineAt.value = Date.now()

    if (wasOnline) {
      onOffline?.()
    }
  }

  // Handle connection change
  const handleConnectionChange = () => {
    updateConnectionInfo()
  }

  // Active connectivity check (ping a URL)
  const checkConnectivity = async () => {
    if (!checkUrl) return isOnline.value

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(checkUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      })

      clearTimeout(timeout)
      handleOnline()
      return true
    } catch (e) {
      handleOffline()
      return false
    }
  }

  /**
   * Queue an action to be executed when online
   * @param {Object} action - { id, fn, data, retries }
   */
  const queueAction = (action) => {
    const queueItem = {
      id: action.id || `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fn: action.fn,
      data: action.data,
      retries: action.retries || 3,
      attempts: 0,
      queuedAt: Date.now()
    }

    actionQueue.value.push(queueItem)

    // If online, process immediately
    if (isOnline.value && autoProcess) {
      processQueue()
    }

    return queueItem.id
  }

  /**
   * Remove an action from the queue
   */
  const removeFromQueue = (actionId) => {
    const index = actionQueue.value.findIndex(a => a.id === actionId)
    if (index !== -1) {
      actionQueue.value.splice(index, 1)
    }
  }

  /**
   * Process all queued actions
   */
  const processQueue = async () => {
    if (isProcessingQueue.value || !isOnline.value) return

    isProcessingQueue.value = true

    const queue = [...actionQueue.value]

    for (const action of queue) {
      if (!isOnline.value) break

      try {
        action.attempts++
        await action.fn(action.data)
        removeFromQueue(action.id)
      } catch (error) {
        console.error(`Failed to process queued action ${action.id}:`, error)

        if (action.attempts >= action.retries) {
          // Max retries reached, remove from queue
          removeFromQueue(action.id)
        }
      }
    }

    isProcessingQueue.value = false
  }

  /**
   * Clear all queued actions
   */
  const clearQueue = () => {
    actionQueue.value = []
  }

  // Start periodic connectivity check
  const startPeriodicCheck = () => {
    if (checkUrl && checkInterval > 0) {
      checkTimer.value = setInterval(checkConnectivity, checkInterval)
    }
  }

  // Stop periodic check
  const stopPeriodicCheck = () => {
    if (checkTimer.value) {
      clearInterval(checkTimer.value)
      checkTimer.value = null
    }
  }

  // Setup event listeners
  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      if ('connection' in navigator) {
        navigator.connection.addEventListener('change', handleConnectionChange)
      }

      updateConnectionInfo()
      startPeriodicCheck()
    }
  })

  // Cleanup
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange)
      }

      stopPeriodicCheck()
    }
  })

  return {
    // State
    isOnline: readonly(isOnline),
    isOffline,
    lastOnlineAt: readonly(lastOnlineAt),
    lastOfflineAt: readonly(lastOfflineAt),
    offlineDuration,
    connectionType: readonly(connectionType),
    effectiveType: readonly(effectiveType),
    downlink: readonly(downlink),
    connectionQuality,

    // Queue state
    actionQueue: readonly(actionQueue),
    pendingActionsCount,
    isProcessingQueue: readonly(isProcessingQueue),

    // Methods
    checkConnectivity,
    queueAction,
    removeFromQueue,
    processQueue,
    clearQueue
  }
}

export default useOnlineStatus
