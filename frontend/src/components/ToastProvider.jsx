import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { XMarkIcon } from "@heroicons/react/24/outline"

const ToastContext = React.createContext()

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([])

  const showToast = (toast) => {
    const id = Date.now()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      dismissToast(id)
    }, 3000)
  }

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const value = {
    show: showToast,
    dismiss: dismissToast
  }

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastViewport />
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            title={toast.title}
            description={toast.description}
          />
        ))}
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

const ToastViewport = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      {...props}
    />
  )
)
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef(
  ({ className, variant, title, description, ...props }, ref) => {
    return (
      <ToastPrimitive.Root
        ref={ref}
        className={`group pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full ${
          variant === "destructive"
            ? "border-red-500/20 bg-red-500/15 text-red-500"
            : "border-gray-200 bg-white text-gray-900"
        }`}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && (
            <ToastPrimitive.Title className="text-sm font-semibold">
              {title}
            </ToastPrimitive.Title>
          )}
          {description && (
            <ToastPrimitive.Description className="text-sm opacity-90">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600">
          <XMarkIcon className="h-4 w-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  }
)
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef(
  ({ className, altText, ...props }, ref) => (
    <ToastPrimitive.Action
      ref={ref}
      altText={altText}
      className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 py-1.5 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-500/20 group-[.destructive]:hover:border-red-500/20 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-500"
      {...props}
    />
  )
)
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Close
      ref={ref}
      className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
      toast-close=""
      {...props}
    >
      <XMarkIcon className="h-4 w-4" />
    </ToastPrimitive.Close>
  )
)
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Title
      ref={ref}
      className="text-sm font-semibold [&+div]:text-xs"
      {...props}
    />
  )
)
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Description
      ref={ref}
      className="text-sm opacity-90"
      {...props}
    />
  )
)
ToastDescription.displayName = ToastPrimitive.Description.displayName

export {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
}
