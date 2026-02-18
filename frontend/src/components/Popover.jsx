import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { XMarkIcon } from "@heroicons/react/24/outline"

const Popover = ({
  children,
  content,
  open,
  onOpenChange,
  side = "bottom",
  align = "center",
  trigger,
  ...props
}) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="bg-white rounded-md border border-gray-200 shadow-lg p-4 w-80 z-50 animate-in fade-in-0 zoom-in-95"
          side={side}
          align={align}
          sideOffset={5}
          {...props}
        >
          {content}
          <PopoverPrimitive.Close className="absolute top-2 right-2 rounded-md p-1 hover:bg-gray-100 transition-colors">
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </PopoverPrimitive.Close>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export default Popover