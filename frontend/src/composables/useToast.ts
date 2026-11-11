import { ref, type Ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

const DEFAULT_DURATION = 4000

export function useToast() {
  const show = (toast: Omit<Toast, 'id'>) => {
    const id = ++toastId
    const newToast: Toast = {
      id,
      duration: DEFAULT_DURATION,
      ...toast,
    }
    toasts.value.push(newToast)

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }

    return id
  }

  const dismiss = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, title?: string, duration?: number) =>
    show({ type: 'success', title, message, duration })

  const error = (message: string, title?: string, duration?: number) =>
    show({ type: 'error', title, message, duration })

  const warning = (message: string, title?: string, duration?: number) =>
    show({ type: 'warning', title, message, duration })

  const info = (message: string, title?: string, duration?: number) =>
    show({ type: 'info', title, message, duration })

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
    clear,
  }
}

export function createToastPlugin() {
  return {
    install(app: any) {
      const toast = useToast()
      app.config.globalProperties.$toast = toast
      app.provide('toast', toast)
    },
  }
}