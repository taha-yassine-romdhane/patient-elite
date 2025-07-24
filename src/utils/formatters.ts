/**
 * Utility functions for formatting data consistently across the application
 */

/**
 * Format a date string to a localized date format (DD/MM/YYYY)
 * @param dateString - ISO date string or any valid date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateString);
  }
}

/**
 * Convert a date object to YYYY-MM-DD format for HTML date inputs
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format
 */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting date to input value:', error);
    return '';
  }
}

/**
 * Parse DD/MM/YYYY or DD-MM-YYYY format to Date object
 * @param dateString - Date string in DD/MM/YYYY or DD-MM-YYYY format
 * @returns Date object or null if invalid
 */
export function parseDDMMYYYY(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    // Handle both DD/MM/YYYY and DD-MM-YYYY formats
    const cleanedString = dateString.replace(/[-/]/g, '/');
    const parts = cleanedString.split('/');
    
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    
    // Create date with European format (month is 0-indexed)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Validate the date
    if (date.getFullYear() !== parseInt(year) ||
        date.getMonth() !== parseInt(month) - 1 ||
        date.getDate() !== parseInt(day)) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing DD/MM/YYYY date:', error);
    return null;
  }
}

/**
 * Format date for display in DD/MM/YYYY format regardless of locale
 * @param date - Date object or ISO string
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDateDDMMYYYY(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date DD/MM/YYYY:', error);
    return '';
  }
}

/**
 * Format a number as currency (DT)
 * @param amount - Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-';
  
  try {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount} DT`;
  }
}

/**
 * Format a phone number to a consistent format
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XX XXX XXX for Tunisian numbers
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  // Return original if not matching expected format
  return phone;
}

/**
 * Get status badge class based on status value
 * @param status - Status string
 * @returns CSS class string for the badge
 */
export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'RETURNED':
      return 'bg-green-100 text-green-800';
    case 'NOT_RETURNED':
      return 'bg-red-100 text-red-800';
    case 'PARTIALLY_RETURNED':
      return 'bg-yellow-100 text-yellow-800';
    case 'DAMAGED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get payment method display text
 * @param method - Payment method code
 * @returns Human-readable payment method
 */
export function getPaymentMethodDisplay(method: string): string {
  switch (method.toUpperCase()) {
    case 'CASH':
    case 'ESPÈCES':
      return 'Espèces';
    case 'CHEQUE':
      return 'Chèque';
    case 'TRAITE':
      return 'Traite';
    case 'CNAM':
      return 'CNAM';
    case 'VIREMENT':
      return 'Virement';
    case 'MONDAT':
      return 'Mandat';
    default:
      return method;
  }
}
