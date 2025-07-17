"use client";

import { useState } from "react";
import { SALETYPE } from "@prisma/client";

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

interface PaymentFormProps {
  onAddPayment: (payment: PaymentEntry) => void;
}

export default function PaymentForm({ onAddPayment }: PaymentFormProps) {
  const [newPayment, setNewPayment] = useState<{
    method: SALETYPE;
    amount: number;
    cashTotal: number;
    cashAcompte: number;
    cashRest: number;
    cashRestDate: string;
    cnamStatus: "ATTENTE" | "ACCORD";
    cnamFollowupDate: string;
    traiteDate: string;
  }>({ 
    method: "CASH", 
    amount: 0,
    cashTotal: 0,
    cashAcompte: 0,
    cashRest: 0,
    cashRestDate: "",
    cnamStatus: "ATTENTE",
    cnamFollowupDate: "",
    traiteDate: ""
  });

  // Handle cash payment calculation
  const handleCashCalculation = (field: 'cashTotal' | 'cashAcompte', value: number) => {
    const updated = { ...newPayment, [field]: value };
    
    if (field === 'cashTotal') {
      updated.cashRest = value - updated.cashAcompte;
      updated.amount = updated.cashAcompte; // Amount is the acompte for now
    } else if (field === 'cashAcompte') {
      updated.cashRest = updated.cashTotal - value;
      updated.amount = value; // Amount is the acompte
    }
    
    setNewPayment(updated);
  };

  // Add a new payment
  const handleAddPayment = () => {
    if (newPayment.amount < 0) return;
    
    // For cash payments, allow zero down payment
    if (newPayment.method === "CASH" && (!newPayment.cashTotal || newPayment.cashTotal <= 0)) {
      return;
    }
    
    const paymentData: PaymentEntry = {
      method: newPayment.method,
      amount: newPayment.amount
    };

    // Add specific fields based on payment type
    if (newPayment.method === "CASH") {
      paymentData.cashTotal = newPayment.cashTotal;
      paymentData.cashAcompte = newPayment.cashAcompte;
      paymentData.cashRest = newPayment.cashRest;
      if (newPayment.cashRest > 0 && newPayment.cashRestDate) {
        paymentData.cashRestDate = newPayment.cashRestDate;
      }
    } else if (newPayment.method === "CNAM") {
      paymentData.cnamStatus = newPayment.cnamStatus;
      if (newPayment.cnamStatus === "ATTENTE" && newPayment.cnamFollowupDate) {
        paymentData.cnamFollowupDate = newPayment.cnamFollowupDate;
      }
    } else if (newPayment.method === "TRAITE") {
      paymentData.traiteDate = newPayment.traiteDate;
    }
    
    onAddPayment(paymentData);
    
    // Reset form
    setNewPayment({ 
      method: "CASH", 
      amount: 0,
      cashTotal: 0,
      cashAcompte: 0,
      cashRest: 0,
      cashRestDate: "",
      cnamStatus: "ATTENTE",
      cnamFollowupDate: "",
      traiteDate: ""
    });
  };

  // Payment methods from SALETYPE enum
  const paymentMethods = [
    { value: "CASH", label: "Espèces" },
    { value: "CHEQUE", label: "Chèque" },
    { value: "TRAITE", label: "Traite" },
    { value: "CNAM", label: "CNAM" },
    { value: "VIREMENT", label: "Virement bancaire" },
    { value: "MONDAT", label: "Mandat" }
  ];

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
      <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Ajouter un paiement
      </h3>
      
      <div className="mb-4">
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Méthode de paiement
        </label>
        <select
          id="paymentMethod"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          value={newPayment.method}
          onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as SALETYPE })}
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      {/* Specific fields based on payment method */}
      {newPayment.method === "CASH" && (
        <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-3">Détails du paiement en espèces</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="cashTotal" className="block text-sm font-medium text-gray-700 mb-1">
                Total (TND)
              </label>
              <input
                type="number"
                id="cashTotal"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={newPayment.cashTotal || ""}
                onChange={(e) => handleCashCalculation('cashTotal', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 2000"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="cashAcompte" className="block text-sm font-medium text-gray-700 mb-1">
                Acompte (TND)
              </label>
              <input
                type="number"
                id="cashAcompte"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={newPayment.cashAcompte || ""}
                onChange={(e) => handleCashCalculation('cashAcompte', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 500 (0 pour paiement différé)"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="cashRest" className="block text-sm font-medium text-gray-700 mb-1">
                Reste (TND)
              </label>
              <input
                type="number"
                id="cashRest"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={newPayment.cashRest || ""}
                disabled
                placeholder="Calculé automatiquement"
              />
            </div>
          </div>
          
          {/* Date for cash rest payment */}
          {newPayment.cashRest > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cashRestDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de paiement du reste <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="cashRestDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={newPayment.cashRestDate}
                  onChange={(e) => setNewPayment({ ...newPayment, cashRestDate: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Cette date sera ajoutée au calendrier
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {newPayment.method === "CNAM" && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Détails du paiement CNAM</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Montant (TND)
              </label>
              <input
                type="number"
                id="paymentAmount"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={newPayment.amount || ""}
                onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 1475"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="cnamStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Statut du dossier CNAM
              </label>
              <select
                id="cnamStatus"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={newPayment.cnamStatus}
                onChange={(e) => setNewPayment({ ...newPayment, cnamStatus: e.target.value as "ATTENTE" | "ACCORD" })}
              >
                <option value="ATTENTE">ATTENTE</option>
                <option value="ACCORD">ACCORD</option>
              </select>
            </div>
          </div>
          
          {/* Date for CNAM follow-up */}
          {newPayment.cnamStatus === "ATTENTE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cnamFollowupDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de suivi CNAM <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="cnamFollowupDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newPayment.cnamFollowupDate}
                  onChange={(e) => setNewPayment({ ...newPayment, cnamFollowupDate: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Cette date sera ajoutée au calendrier
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {newPayment.method === "TRAITE" && (
        <div className="mb-4 p-4 bg-orange-50 rounded-md border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-3">Détails du paiement par traite</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Montant (TND)
              </label>
              <input
                type="number"
                id="paymentAmount"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                value={newPayment.amount || ""}
                onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 1500"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="traiteDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date d&apos;échéance
              </label>
              <input
                type="date"
                id="traiteDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                value={newPayment.traiteDate}
                onChange={(e) => setNewPayment({ ...newPayment, traiteDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* For other payment methods, just show amount */}
      {!["CASH", "CNAM", "TRAITE"].includes(newPayment.method) && (
        <div className="mb-4">
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Montant (TND)
          </label>
          <input
            type="number"
            id="paymentAmount"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={newPayment.amount || ""}
            onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
            placeholder="Ex: 1475"
            step="0.01"
          />
        </div>
      )}

      <button
        type="button"
        className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleAddPayment}
        disabled={
          newPayment.amount < 0 ||
          (newPayment.method === "TRAITE" && !newPayment.traiteDate) ||
          (newPayment.method === "CASH" && (!newPayment.cashTotal || newPayment.cashTotal <= 0)) ||
          (newPayment.method === "CASH" && newPayment.cashRest > 0 && !newPayment.cashRestDate) ||
          (newPayment.method === "CNAM" && newPayment.cnamStatus === "ATTENTE" && !newPayment.cnamFollowupDate)
        }
      >
        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter le paiement
      </button>
    </div>
  );
} 