"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { fr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string | Date
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
  error?: string
  id?: string
  min?: string
  max?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
  disabled = false,
  required = false,
  label,
  error,
  id,
  min,
  max
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>()
  const [open, setOpen] = React.useState(false)

  // Convert value to Date object
  React.useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        // Check if it's DD/MM/YYYY format or ISO format
        if (value.includes('/')) {
          // DD/MM/YYYY format
          try {
            const parsedDate = parse(value, 'dd/MM/yyyy', new Date())
            setDate(parsedDate)
          } catch (error) {
            console.error('Error parsing DD/MM/YYYY date:', error)
            setDate(undefined)
          }
        } else {
          // ISO format
          setDate(new Date(value))
        }
      } else {
        setDate(value)
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    
    if (selectedDate) {
      // Convert to ISO format for backend compatibility, avoiding timezone issues
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const isoString = `${year}-${month}-${day}`
      onChange(isoString)
    } else {
      onChange('')
    }
    
    setOpen(false)
  }

  // Format display text
  const displayText = date ? format(date, 'dd/MM/yyyy', { locale: fr }) : placeholder

  // Convert min/max strings to Date objects for calendar
  const minDate = min ? new Date(min) : undefined
  const maxDate = max ? new Date(max) : undefined

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal hover:bg-gray-50 transition-colors duration-200",
              !date && "text-muted-foreground",
              error && "border-red-500 ring-red-500/20",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => {
              if (minDate && date < minDate) return true
              if (maxDate && date > maxDate) return true
              return false
            }}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}