"use client";

import React, { useState, useEffect } from 'react';
import { toDateInputValue, formatDateDDMMYYYY } from '@/utils/formatters';

interface DateInputProps {
  value?: string | Date;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  error?: string;
  id?: string;
  min?: string;
  max?: string;
}

/**
 * DateInput component that displays DD/MM/YYYY format in the UI
 * but works with HTML date input (YYYY-MM-DD) internally
 */

export default function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className = "",
  disabled = false,
  required = false,
  label,
  error,
  id,
  min,
  max
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (value) {
      const dateValue = typeof value === 'string' ? value : value.toISOString();
      setDisplayValue(formatDateDDMMYYYY(dateValue));
      setInputValue(toDateInputValue(dateValue));
    } else {
      setDisplayValue('');
      setInputValue('');
    }
  }, [value]);

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue) {
      setDisplayValue(formatDateDDMMYYYY(newValue));
      onChange(newValue);
    } else {
      setDisplayValue('');
      onChange('');
    }
    setShowDatePicker(false);
  };

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value;
    setDisplayValue(newDisplayValue);

    // Try to parse DD/MM/YYYY format
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = newDisplayValue.match(regex);
    
    if (match) {
      const [, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Validate the date
      if (date.getFullYear() === parseInt(year) &&
          date.getMonth() === parseInt(month) - 1 &&
          date.getDate() === parseInt(day)) {
        const isoValue = toDateInputValue(date);
        setInputValue(isoValue);
        onChange(isoValue);
      }
    } else if (newDisplayValue === '') {
      setInputValue('');
      onChange('');
    }
  };

  const handleDisplayFocus = () => {
    setShowDatePicker(true);
  };

  const baseInputClasses = `
    w-full px-3 py-2 pr-10 border border-gray-300 rounded-md 
    focus:ring-purple-500 focus:border-purple-500 
    hover:border-gray-400 transition-colors duration-200
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:border-gray-300
    cursor-text
    ${error ? 'border-red-500 ring-red-500' : ''}
    ${className}
  `.trim();

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Display input showing DD/MM/YYYY */}
        <input
          type="text"
          id={id}
          value={displayValue}
          onChange={handleDisplayChange}
          onFocus={handleDisplayFocus}
          placeholder={placeholder}
          className={baseInputClasses}
          disabled={disabled}
          required={required}
        />
        
        {/* Hidden HTML5 date input for date picker */}
        {showDatePicker && (
          <input
            type="date"
            value={inputValue}
            onChange={handleDatePickerChange}
            onBlur={() => setShowDatePicker(false)}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            min={min}
            max={max}
            autoFocus
          />
        )}
        
        {/* Calendar icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}