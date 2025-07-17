/**
 * Diagnostic utility functions for IAH calculations and severity determination
 */

export type SeverityLevel = 'negative' | 'moderate' | 'severe';

export interface DiagnosticSeverity {
  level: SeverityLevel;
  label: string;
  labelFr: string;
  color: string;
  bgColor: string;
  textColor: string;
}

/**
 * Calculate the severity level based on IAH (Apnea-Hypopnea Index) value
 * @param iahValue - The IAH result value
 * @returns DiagnosticSeverity object with level, labels, and styling info
 */
export function calculateIAHSeverity(iahValue: number): DiagnosticSeverity {
  if (iahValue < 0) {
    throw new Error('IAH value cannot be negative');
  }

  if (iahValue <= 15) {
    return {
      level: 'negative',
      label: 'Negative',
      labelFr: 'Négatif',
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800'
    };
  } else if (iahValue <= 29) {
    return {
      level: 'moderate',
      label: 'Moderate',
      labelFr: 'Modéré',
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800'
    };
  } else {
    return {
      level: 'severe',
      label: 'Severe',
      labelFr: 'Sévère',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    };
  }
}

/**
 * Format IAH value for display
 * @param iahValue - The IAH result value
 * @returns Formatted string with one decimal place
 */
export function formatIAHValue(iahValue: number): string {
  return iahValue.toFixed(1);
}

/**
 * Get severity badge classes for Tailwind CSS
 * @param severity - The severity level
 * @returns Object with CSS classes for badge styling
 */
export function getSeverityBadgeClasses(severity: SeverityLevel) {
  const severityData = getSeverityData(severity);
  return {
    base: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`,
    color: `${severityData.bgColor} ${severityData.textColor}`,
    full: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityData.bgColor} ${severityData.textColor}`
  };
}

/**
 * Get severity data by level
 * @param level - The severity level
 * @returns DiagnosticSeverity object
 */
function getSeverityData(level: SeverityLevel): DiagnosticSeverity {
  switch (level) {
    case 'negative':
      return {
        level: 'negative',
        label: 'Negative',
        labelFr: 'Négatif',
        color: 'emerald',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800'
      };
    case 'moderate':
      return {
        level: 'moderate',
        label: 'Moderate',
        labelFr: 'Modéré',
        color: 'amber',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800'
      };
    case 'severe':
      return {
        level: 'severe',
        label: 'Severe',
        labelFr: 'Sévère',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      };
    default:
      throw new Error(`Unknown severity level: ${level}`);
  }
}

/**
 * Validate IAH input value
 * @param value - Input value to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateIAHInput(value: string): { isValid: boolean; error?: string; numericValue?: number } {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'La valeur IAH est requise' };
  }

  const numericValue = parseFloat(value);

  if (isNaN(numericValue)) {
    return { isValid: false, error: 'La valeur IAH doit être un nombre' };
  }

  if (numericValue < 0) {
    return { isValid: false, error: 'La valeur IAH ne peut pas être négative' };
  }

  if (numericValue > 200) {
    return { isValid: false, error: 'La valeur IAH semble trop élevée (max 200)' };
  }

  return { isValid: true, numericValue };
} 