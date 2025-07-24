"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-lg w-full';
      case 'md':
        return 'max-w-3xl w-full';
      case 'lg':
        return 'max-w-5xl w-full';
      case 'xl':
        return 'max-w-7xl w-full';
      case 'full':
        return 'max-w-[95vw] w-[95vw]';
      default:
        return 'max-w-3xl w-full';
    }
  };

  useEffect(() => {
    // Handle escape key press
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    // Handle clicking outside the modal
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Check if click is on a select dropdown or its content
      const isSelectDropdown = (target as Element)?.closest('[data-radix-select-content]') ||
                               (target as Element)?.closest('[data-radix-popper-content-wrapper]') ||
                               (target as Element)?.closest('[role="listbox"]') ||
                               (target as Element)?.closest('[data-radix-select-viewport]');
      
      if (modalRef.current && !modalRef.current.contains(target) && !isSelectDropdown && isOpen) {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleOutsideClick);

    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className={`bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] ${getSizeClasses()} ${className}`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none rounded-full p-1 focus:ring-2 focus:ring-blue-500/50 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
