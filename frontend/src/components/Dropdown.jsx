import * as React from "react"
import * as Select from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

const Dropdown = ({
  children,
  value,
  onValueChange,
  placeholder,
  className,
  ...props
}) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange} {...props}>
      <Select.Trigger
        className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-gray-400">
          <ChevronDownIcon className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
          <Select.ScrollUpButton className="flex items-center justify-center h-6 text-gray-400 cursor-default">
            <ChevronUpIcon className="h-4 w-4" />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {children}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-6 text-gray-400 cursor-default">
            <ChevronDownIcon className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

const DropdownItem = ({ children, value, ...props }) => {
  return (
    <Select.Item
      value={value}
      className="flex items-center px-2 py-1.5 text-sm text-gray-700 rounded-sm cursor-default select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
      {...props}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="ml-auto text-blue-600">
        <CheckIcon className="h-4 w-4" />
      </Select.ItemIndicator>
    </Select.Item>
  )
}

export { Dropdown, DropdownItem }