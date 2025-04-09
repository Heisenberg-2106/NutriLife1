"use client"

import { useState, useEffect, useCallback } from "react"

const TOAST_TIMEOUT = 5000

type ToastProps = {
  id?: string
  title: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastState = ToastProps & { id: string }

let count = 0

function generateId() {
  return `toast-${++count}`
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const toast = useCallback((props: ToastProps) => {
    const id = props.id || generateId()
    setToasts((prev) => [...prev, { id, ...props }])

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const update = useCallback((id: string, props: Partial<ToastProps>) => {
    setToasts((prev) =>
      prev.map((toast) => (toast.id === id ? { ...toast, ...props } : toast))
    )
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismiss(toast.id)
      }, TOAST_TIMEOUT)
    )

    return () => timers.forEach(clearTimeout)
  }, [toasts, dismiss])

  return { toast, dismiss, update, toasts }
}
