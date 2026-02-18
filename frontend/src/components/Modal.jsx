import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { XMarkIcon } from "@heroicons/react/24/outline"

const Modal = ({
  children,
  open,
  onOpenChange,
  title,
  description,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl"
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl border border-gray-200 p-6 focus:outline-none animate-in fade-in-90 slide-in-from-bottom-2`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="text-sm text-gray-500">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-md p-1 hover:bg-gray-100 transition-colors">
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </Dialog.Close>
          </div>
          
          <div className="mt-2">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal