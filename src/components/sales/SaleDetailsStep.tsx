"use client";

import { SALETYPE } from "@prisma/client";
import DeviceForm from "./DeviceForm";
import AccessoryForm from "./AccessoryForm";
import PaymentForm from "./PaymentForm";
import ItemsList from "./ItemsList";
import PaymentSummary from "./PaymentSummary";

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  doctorName?: string;
};

type DeviceItem = {
  type: "DEVICE";
  name: string;
  model: string;
  serialNumber: string;
  quantity: number;
};

type AccessoryItem = {
  type: "ACCESSORY";
  name: string;
  model: string;
  quantity: number;
};

type SaleItem = DeviceItem | AccessoryItem;

type PaymentEntry = {
  method: SALETYPE;
  amount: number;
  // Additional fields for specific payment types
  cashTotal?: number;
  cashAcompte?: number;
  cashRest?: number;
  cashRestDate?: string; // NEW: Date for cash rest payment
  cnamStatus?: "ATTENTE" | "ACCORD";
  cnamFollowupDate?: string; // NEW: Date for CNAM follow-up
  traiteDate?: string;
};

type SaleFormData = {
  patientId: string;
  date: string;
  items: SaleItem[];
  payments: PaymentEntry[];
  totalAmount: number;
  transactionStatus: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
};

interface SaleDetailsStepProps {
  patient: Patient;
  saleData: SaleFormData;
  onSaleDataChange: (data: SaleFormData) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string;
}

export default function SaleDetailsStep({
  patient,
  saleData,
  onSaleDataChange,
  onPrevious,
  onSubmit,
  isLoading,
  error
}: SaleDetailsStepProps) {
  // Calculate total amount from payments
  const calculateTotalFromPayments = (payments: PaymentEntry[]): number => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  // Add a new device
  const handleAddDevice = (deviceData: Omit<DeviceItem, "type" | "quantity">) => {
    const updatedItems = [
      ...saleData.items,
      {
        type: "DEVICE" as const,
        name: deviceData.name,
        model: deviceData.model,
        serialNumber: deviceData.serialNumber,
        quantity: 1 // Always 1 for devices
      }
    ];
    
    onSaleDataChange({
      ...saleData,
      items: updatedItems
    });
  };

  // Add a new accessory
  const handleAddAccessory = (accessoryData: Omit<AccessoryItem, "type">) => {
    const updatedItems = [
      ...saleData.items,
      {
        type: "ACCESSORY" as const,
        name: accessoryData.name,
        model: accessoryData.model,
        quantity: accessoryData.quantity
      }
    ];
    
    onSaleDataChange({
      ...saleData,
      items: updatedItems
    });
  };

  // Add a new payment
  const handleAddPayment = (paymentData: PaymentEntry) => {
    const updatedPayments = [
      ...saleData.payments,
      paymentData
    ];
    
    onSaleDataChange({
      ...saleData,
      payments: updatedPayments,
      totalAmount: calculateTotalFromPayments(updatedPayments)
    });
  };

  // Remove an item
  const handleRemoveItem = (index: number) => {
    const updatedItems = saleData.items.filter((_, i) => i !== index);
    
    onSaleDataChange({
      ...saleData,
      items: updatedItems
    });
  };

  // Remove a payment
  const handleRemovePayment = (index: number) => {
    const updatedPayments = saleData.payments.filter((_, i) => i !== index);
    
    onSaleDataChange({
      ...saleData,
      payments: updatedPayments,
      totalAmount: calculateTotalFromPayments(updatedPayments)
    });
  };

  // Update accessory quantity only (devices always have quantity 1)
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const updatedItems = [...saleData.items];
    const item = updatedItems[index];
    
    // Only allow quantity change for accessories
    if (item.type === "ACCESSORY") {
      updatedItems[index].quantity = newQuantity;
    }
    
    onSaleDataChange({
      ...saleData,
      items: updatedItems
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-medium text-blue-800">Patient sélectionné</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nom complet</p>
            <p className="text-base">{patient.fullName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Téléphone</p>
            <p className="text-base">{patient.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Région</p>
            <p className="text-base">{patient.region}</p>
          </div>
          {patient.doctorName && (
            <div>
              <p className="text-sm font-medium text-gray-500">Médecin</p>
              <p className="text-base">{patient.doctorName}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date de la vente
        </label>
        <input
          type="date"
          id="date"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={saleData.date}
          onChange={(e) => onSaleDataChange({ ...saleData, date: e.target.value })}
        />
      </div>

      {/* Device Form Component */}
      <DeviceForm onAddDevice={handleAddDevice} />

      {/* Accessory Form Component */}
      <AccessoryForm onAddAccessory={handleAddAccessory} />

      {/* Items List Component */}
      <ItemsList 
        items={saleData.items}
        onRemoveItem={handleRemoveItem}
        onQuantityChange={handleQuantityChange}
      />

      {/* Payment Form Component */}
      <PaymentForm onAddPayment={handleAddPayment} />

      {/* Payment Summary Component */}
      <PaymentSummary
        payments={saleData.payments}
        onRemovePayment={handleRemovePayment}
      />

      {/* Notes */}
      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={saleData.notes || ""}
          onChange={(e) => onSaleDataChange({ ...saleData, notes: e.target.value })}
          placeholder="Notes additionnelles..."
        ></textarea>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          onClick={onPrevious}
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={onSubmit}
          disabled={saleData.items.length === 0 || saleData.payments.length === 0 || isLoading}
        >
          {isLoading ? (
            <svg className="w-4 h-4 mr-2 inline animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isLoading ? "Enregistrement..." : "Enregistrer la vente"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
