# Error Handling Guidelines

Comprehensive patterns for handling errors gracefully in the UI.

## Principles

1. **Never show raw errors to users** - Translate technical errors to user-friendly messages
2. **Always provide recovery options** - Retry, go back, or contact support
3. **Log errors for debugging** - Console + optional error tracking service
4. **Prevent errors when possible** - Validation, loading states, confirmation dialogs

## Error Boundary Pattern

Wrap major sections in error boundaries to prevent cascading failures.

### Basic Usage

```vue
<template>
  <ErrorBoundary @error="handleError" @retry="fetchData">
    <YourComponent />
  </ErrorBoundary>
</template>

<script>
import { ErrorBoundary } from '@/components/common'

export default {
  components: { ErrorBoundary },
  methods: {
    handleError({ error, info }) {
      // Log to error tracking service
      console.error('Component error:', error, info)
    },
    fetchData() {
      // Retry logic
    }
  }
}
</script>
```

### Error Boundary Features

The `ErrorBoundary` component provides:

- User-friendly error messages based on error type
- Expandable technical details (development only)
- Retry button
- "Go to Dashboard" button
- Error event emission for tracking

## API Error Handling

### Centralized API Method

```javascript
async api(method, url, body, options = {}) {
  const { silent = false } = options

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMsg = data.detail || data.message || `Request failed (${response.status})`

      if (!silent) {
        this.showToast(errorMsg, 'error')
      }

      return {
        error: true,
        status: response.status,
        message: errorMsg
      }
    }

    return data
  } catch (e) {
    if (!silent) {
      this.showToast('Network error. Please check your connection.', 'error')
    }

    return {
      error: true,
      message: e.message
    }
  }
}
```

### Using the API Method

```javascript
async saveItem() {
  const result = await this.api('POST', '/api/items', this.form)

  // Check for errors
  if (result?.error) {
    // Error already shown via toast, just return
    return
  }

  // Success
  this.showToast('Item saved successfully')
  this.closeModal()
  await this.fetchData()
}
```

### Silent API Calls

For background operations where you don't want to show errors:

```javascript
// Silent call - no toast on error
const result = await this.api('GET', '/api/status', null, { silent: true })

if (result?.error) {
  // Handle silently or show custom message
  console.warn('Status check failed:', result.message)
}
```

## User-Friendly Error Messages

Map technical errors to helpful messages:

```javascript
function getUserFriendlyMessage(error) {
  const message = error?.message?.toLowerCase() || ''

  if (message.includes('network') || message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }

  if (message.includes('401') || message.includes('unauthorized')) {
    return 'Your session has expired. Please log in again.'
  }

  if (message.includes('403') || message.includes('forbidden')) {
    return "You don't have permission to access this resource."
  }

  if (message.includes('404') || message.includes('not found')) {
    return 'The requested resource could not be found.'
  }

  if (message.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  if (message.includes('500')) {
    return 'Something went wrong on our end. Please try again later.'
  }

  return 'An unexpected error occurred. Please try again.'
}
```

## Toast Notifications

### Toast Types

```javascript
// Success - Green
this.showToast('Item saved successfully', 'success')

// Error - Red
this.showToast('Failed to save item', 'error')

// Warning - Yellow
this.showToast('Changes not saved', 'warning')

// Info - Blue
this.showToast('Processing your request...', 'info')
```

### Common Toast Messages

```javascript
const toastMessages = {
  // Create
  createSuccess: (item) => `${item} created successfully`,
  createError: (item) => `Failed to create ${item}`,

  // Update
  updateSuccess: (item) => `${item} updated successfully`,
  updateError: (item) => `Failed to update ${item}`,

  // Delete
  deleteSuccess: (item) => `${item} deleted`,
  deleteError: (item) => `Failed to delete ${item}`,

  // Network
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',

  // Auth
  sessionExpired: 'Your session has expired. Please log in again.',
  unauthorized: "You don't have permission for this action."
}
```

## Confirmation Dialogs

Always confirm destructive actions:

```vue
<template>
  <BaseConfirmDialog
    v-model="showConfirm"
    title="Delete Item"
    message="This action cannot be undone. Are you sure?"
    confirm-text="Delete"
    cancel-text="Cancel"
    variant="danger"
    :loading="deleting"
    @confirm="handleDelete"
    @cancel="showConfirm = false"
  />

  <button @click="showConfirm = true">Delete</button>
</template>

<script>
export default {
  data() {
    return {
      showConfirm: false,
      deleting: false
    }
  },
  methods: {
    async handleDelete() {
      this.deleting = true
      try {
        const result = await this.api('DELETE', `/api/items/${this.itemId}`)
        if (result?.error) return

        this.showConfirm = false
        this.showToast('Item deleted')
        await this.fetchData()
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>
```

## Form Validation Errors

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput
      v-model="form.email"
      type="email"
      label="Email"
      :error="errors.email"
      @blur="validateEmail"
    />

    <BaseInput
      v-model="form.password"
      type="password"
      label="Password"
      :error="errors.password"
      @blur="validatePassword"
    />

    <!-- Form-level error -->
    <div v-if="errors.form" class="form-error" role="alert">
      {{ errors.form }}
    </div>

    <BaseButton type="submit" :loading="submitting" :disabled="hasErrors">
      Submit
    </BaseButton>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: { email: '', password: '' },
      errors: {},
      submitting: false
    }
  },
  computed: {
    hasErrors() {
      return Object.keys(this.errors).length > 0
    }
  },
  methods: {
    validateEmail() {
      if (!this.form.email) {
        this.errors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(this.form.email)) {
        this.errors.email = 'Please enter a valid email'
      } else {
        delete this.errors.email
      }
    },
    validatePassword() {
      if (!this.form.password) {
        this.errors.password = 'Password is required'
      } else if (this.form.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters'
      } else {
        delete this.errors.password
      }
    },
    async handleSubmit() {
      this.validateEmail()
      this.validatePassword()

      if (this.hasErrors) return

      this.submitting = true
      this.errors = {}

      try {
        const result = await this.api('POST', '/api/auth', this.form)

        if (result?.error) {
          this.errors.form = result.message
          return
        }

        // Success
        this.$router.push('/dashboard')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
```

## Loading States

Prevent errors by showing loading states:

```vue
<template>
  <div>
    <!-- Loading skeleton -->
    <template v-if="loading">
      <BaseSkeleton variant="card" />
      <BaseSkeleton variant="text" :lines="3" />
    </template>

    <!-- Content -->
    <template v-else-if="data">
      <ItemCard :data="data" />
    </template>

    <!-- Empty state -->
    <BaseEmptyState
      v-else
      icon="inbox"
      title="No data"
      description="Create your first item to get started."
    />
  </div>
</template>
```

## Error Tracking Integration

For production error tracking (e.g., Sentry):

```javascript
// In ErrorBoundary or global error handler
function reportError(error, context = {}) {
  // Console logging for development
  console.error('Error:', error)
  console.error('Context:', context)

  // Send to error tracking service
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      extra: context
    })
  }
}
```
