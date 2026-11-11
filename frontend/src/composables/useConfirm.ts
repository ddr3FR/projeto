import { ref, type Ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'secondary'
}

interface ConfirmResult {
  open: (options: ConfirmOptions) => Promise<boolean>
  close: () => void
  confirm: () => void
  isOpen: Ref<boolean>
  options: Ref<ConfirmOptions | null>
}

let confirmId = 0

export function useConfirm(): ConfirmResult {
  const isOpen = ref(false)
  const options = ref<ConfirmOptions | null>(null)
  let resolvePromise: ((value: boolean) => void) | null = null

  const open = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmId++
      options.value = {
        title: 'Confirmação',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        variant: 'danger',
        ...opts,
      }
      isOpen.value = true
      resolvePromise = resolve
    })
  }

  const close = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  const confirm = () => {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  return {
    isOpen,
    options,
    open,
    close,
    confirm,
  }
}