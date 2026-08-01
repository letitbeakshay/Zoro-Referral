// src/components/ui/toast.tsx
"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  title?: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void
  toasts: Toast[]
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(
    ({ title, message, type = "info", duration = 3000 }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, message, type, duration }])

      setTimeout(() => {
        dismiss(id)
      }, duration)
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border pointer-events-auto shadow-lg transition-all duration-300 animate-in slide-in-from-top-2 sm:slide-in-from-right-2 ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-300"
              : t.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-300"
              : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/80 dark:border-blue-900 dark:text-blue-300"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === "success" && <CheckCircle2 className="h-5 w-5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5" />}
            {t.type === "info" && <Info className="h-5 w-5" />}
          </div>
          <div className="flex-1 space-y-1">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            <p className="text-xs opacity-90 leading-relaxed">{t.message}</p>
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 p-0.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>,
    document.body
  )
}
