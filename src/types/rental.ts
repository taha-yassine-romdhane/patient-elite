import { RENTAL_ITEM_TYPE, SALETYPE } from "@prisma/client";

// Core Patient type for rental operations
export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  doctorName?: string;
}


// Rental configuration settings
export interface RentalConfiguration {
  startDate: string;
  endDate: string;
  contractNumber?: string;
  
  
  // Special terms
  specialTerms: {
    earlyReturnAllowed: boolean;
    earlyReturnPenalty?: number;
    lateReturnPenalty?: number;
    equipmentExchangeAllowed: boolean;
    maintenanceIncluded: boolean;
    insuranceRequired: boolean;
  };
  
  // Additional settings
  notes?: string;
  internalNotes?: string;
}


// Alert for payment follow-up
export interface PaymentAlert {
  id: string;
  date: string;
  note: string;
  createdAt: string;
}

// Payment schedule entry
export interface PaymentScheduleEntry {
  id: string;
  type: 'single' | 'installment' | 'recurring' | 'custom';
  method: SALETYPE;
  amount: number;
  dueDate: string;
  description: string;
  methodDetails?: {
    chequeNumber?: string;
    chequeDate?: string;
    traiteDueDate?: string;
    cnamStatus?: string;
    cnamFollowupDate?: string;
    // Enhanced cash payment details
    cashTotalPrice?: number;
    cashCurrentPayment?: number;
    cashRemainingAmount?: number;
    cashRemainingDueDate?: string;
  };
  alerts: PaymentAlert[];
  isProcessed: boolean;
  notes?: string;
}


// API request/response types
export interface CreateRentalRequest {
  patientId: string;
  startDate: string;
  endDate: string;
  contractNumber?: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  returnStatus: "NOT_RETURNED" | "RETURNED" | "PARTIALLY_RETURNED" | "DAMAGED";
  notes?: string;
  internalNotes?: string;
  specialTerms: {
    earlyReturnAllowed: boolean;
    equipmentExchangeAllowed: boolean;
    maintenanceIncluded: boolean;
    insuranceRequired: boolean;
  };
  rentalItems: {
    itemType: RENTAL_ITEM_TYPE;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    startDate: string;
    endDate: string;
    notes?: string;
    deviceData?: {
      name: string;
      model: string;
      serialNumber: string;
    };
    accessoryData?: {
      name: string;
      model: string;
    };
    isFree: boolean;
    category: string;
  }[];
  paymentSchedule: {
    type: 'single' | 'installment' | 'recurring' | 'custom';
    method: SALETYPE;
    amount: number;
    dueDate: string;
    description: string;
    methodDetails?: {
      chequeNumber?: string;
      chequeDate?: string;
      traiteDueDate?: string;
      cnamStatus?: string;
      cnamFollowupDate?: string;
      // Enhanced cash payment details
      cashTotalPrice?: number;
      cashCurrentPayment?: number;
      cashRemainingAmount?: number;
      cashRemainingDueDate?: string;
    };
    alerts: {
      id: string;
      date: string;
      note: string;
      createdAt: string;
    }[];
    isProcessed: boolean;
    notes?: string;
  }[];
}

export interface CreateRentalResponse {
  id: string;
  message: string;
  rental: {
    id: string;
    contractNumber?: string;
    status: string;
    createdAt: string;
  };
}