"use client";

import { useState } from "react";
import { SALETYPE } from "@prisma/client";

type PaymentEntry = {
  method: SALETYPE;
  amount: number;
  paymentDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  // Additional fields for specific payment types
  cashTotal?: number;
  cashAcompte?: number;
  cashRest?: number;
  cashRestDate?: string;
  cnamStatus?: "ATTENTE" | "ACCORD";
  cnamFollowupDate?: string;
  traiteDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
};

interface PaymentFormProps {
  onAddPayment: (payment: PaymentEntry) => void;
  itemStartDate?: string;
  itemEndDate?: string;
  totalAmount?: number;
  compact?: boolean;
  editMode?: boolean;
  initialPayment?: PaymentEntry;
}

export default function PaymentForm({ 
  onAddPayment, 
  itemStartDate, 
  itemEndDate, 
  totalAmount,
  compact = false,
  editMode = false,
  initialPayment
}: PaymentFormProps) {
  const [newPayment, setNewPayment] = useState<PaymentEntry>(
    initialPayment || {
      method: SALETYPE.CASH,
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      periodStartDate: itemStartDate || new Date().toISOString().split("T")[0],
      periodEndDate: itemEndDate || new Date().toISOString().split("T")[0],
    }
  );

  const [isExpanded, setIsExpanded] = useState(editMode || !compact);

  // Payment methods from SALETYPE enum
  const paymentMethods = [
    { value: SALETYPE.CASH, label: "Espèces" },
    { value: SALETYPE.CHEQUE, label: "Chèque" },
    { value: SALETYPE.TRAITE, label: "Traite" },
    { value: SALETYPE.CNAM, label: "CNAM" },
    { value: SALETYPE.VIREMENT, label: "Virement bancaire" },
    { value: SALETYPE.MONDAT, label: "Mandat" }
  ];

  const handleAddPayment = () => {
    if (newPayment.amount <= 0) {
      alert("Le montant du paiement doit être supérieur à 0");
      return;
    }
    
    // Check if payment exceeds total amount
    if (totalAmount && newPayment.amount > totalAmount) {
      alert(`Le montant du paiement ne peut pas dépasser ${totalAmount.toFixed(2)} TND`);
      return;
    }
    
    // Additional validation based on payment type
    if (newPayment.method === SALETYPE.CHEQUE && !newPayment.chequeNumber) {
      alert("Le numéro de chèque est requis");
      return;
    }
    if (newPayment.method === SALETYPE.TRAITE && !newPayment.traiteDueDate) {
      alert("La date d'échéance de la traite est requise");
      return;
    }
    if (newPayment.method === SALETYPE.CASH && newPayment.cashTotal && newPayment.cashAcompte && newPayment.cashRest && newPayment.cashRest > 0 && !newPayment.cashRestDate) {
      alert("La date de paiement du reste est requise");
      return;
    }
    if (newPayment.method === SALETYPE.CNAM && newPayment.cnamStatus === "ATTENTE" && !newPayment.cnamFollowupDate) {
      alert("La date de suivi CNAM est requise");
      return;
    }
    
    // Validate payment periods
    if (newPayment.periodStartDate && newPayment.periodEndDate) {
      if (new Date(newPayment.periodStartDate) > new Date(newPayment.periodEndDate)) {
        alert("La date de début de période ne peut pas être postérieure à la date de fin");
        return;
      }
    }
    
    onAddPayment(newPayment);
    
    // Reset form only if not in edit mode
    if (!editMode) {
      setNewPayment({
        method: SALETYPE.CASH,
        amount: 0,
        paymentDate: new Date().toISOString().split("T")[0],
        periodStartDate: itemStartDate || new Date().toISOString().split("T")[0],
        periodEndDate: itemEndDate || new Date().toISOString().split("T")[0],
      });
      if (compact) {
        setIsExpanded(false);
      }
    }
  };

  if (compact && !isExpanded) {
    return (
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un paiement
        </button>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${compact ? 'bg-slate-50' : 'bg-gradient-to-r from-purple-50 to-purple-100'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium flex items-center ${compact ? 'text-slate-800 text-base' : 'text-purple-800 text-lg'}`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {editMode ? 'Modifier le paiement' : 'Ajouter un paiement'}
        </h3>
        {compact && !editMode && (
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
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
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Montant (TND)
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            max={totalAmount}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
          />
          {totalAmount && (
            <p className="text-xs text-gray-500 mt-1">
              Max: {totalAmount.toFixed(2)} TND
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de paiement
          </label>
          <input
            type="date"
            id="paymentDate"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={newPayment.paymentDate}
            onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
          />
        </div>
      </div>

      {/* Payment Method Specific Fields */}
      {newPayment.method === SALETYPE.CHEQUE && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de chèque *
            </label>
            <input
              type="text"
              id="chequeNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={newPayment.chequeNumber || ""}
              onChange={(e) => setNewPayment({ ...newPayment, chequeNumber: e.target.value })}
              placeholder="Numéro du chèque"
            />
          </div>
          <div>
            <label htmlFor="chequeDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date du chèque
            </label>
            <input
              type="date"
              id="chequeDate"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={newPayment.chequeDate || ""}
              onChange={(e) => setNewPayment({ ...newPayment, chequeDate: e.target.value })}
            />
          </div>
        </div>
      )}

      {newPayment.method === SALETYPE.TRAITE && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="traiteDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de traite
            </label>
            <input
              type="date"
              id="traiteDate"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={newPayment.traiteDate || ""}
              onChange={(e) => setNewPayment({ ...newPayment, traiteDate: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="traiteDueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date d&apos;échéance *
            </label>
            <input
              type="date"
              id="traiteDueDate"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={newPayment.traiteDueDate || ""}
              onChange={(e) => setNewPayment({ ...newPayment, traiteDueDate: e.target.value })}
            />
          </div>
        </div>
      )}

      {newPayment.method === SALETYPE.CASH && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-3">Détails du paiement espèces</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cashTotal" className="block text-sm font-medium text-gray-700 mb-1">
                Montant total (TND)
              </label>
              <input
                type="number"
                id="cashTotal"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={newPayment.cashTotal || ""}
                onChange={(e) => {
                  const total = parseFloat(e.target.value) || 0;
                  const acompte = newPayment.cashAcompte || 0;
                  setNewPayment({ 
                    ...newPayment, 
                    cashTotal: total,
                    cashRest: total - acompte
                  });
                }}
                placeholder="Montant total"
              />
            </div>
            <div>
              <label htmlFor="cashAcompte" className="block text-sm font-medium text-gray-700 mb-1">
                Acompte versé (TND)
              </label>
              <input
                type="number"
                id="cashAcompte"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={newPayment.cashAcompte || ""}
                onChange={(e) => {
                  const acompte = parseFloat(e.target.value) || 0;
                  const total = newPayment.cashTotal || 0;
                  setNewPayment({ 
                    ...newPayment, 
                    cashAcompte: acompte,
                    cashRest: total - acompte
                  });
                }}
                placeholder="Acompte"
              />
            </div>
            <div>
              <label htmlFor="cashRest" className="block text-sm font-medium text-gray-700 mb-1">
                Reste à payer (TND)
              </label>
              <input
                type="number"
                id="cashRest"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                value={newPayment.cashRest || ""}
                readOnly
                placeholder="Calculé automatiquement"
              />
            </div>
          </div>
          {newPayment.cashRest && newPayment.cashRest > 0 && (
            <div className="mt-3">
              <label htmlFor="cashRestDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de paiement du reste *
              </label>
              <input
                type="date"
                id="cashRestDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={newPayment.cashRestDate || ""}
                onChange={(e) => setNewPayment({ ...newPayment, cashRestDate: e.target.value })}
              />
            </div>
          )}
        </div>
      )}

      {newPayment.method === SALETYPE.CNAM && (
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-800 mb-3">Détails CNAM</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cnamStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Statut CNAM
              </label>
              <select
                id="cnamStatus"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                value={newPayment.cnamStatus || "ATTENTE"}
                onChange={(e) => setNewPayment({ ...newPayment, cnamStatus: e.target.value as "ATTENTE" | "ACCORD" })}
              >
                <option value="ATTENTE">En attente</option>
                <option value="ACCORD">Accordé</option>
              </select>
            </div>
            {newPayment.cnamStatus === "ATTENTE" && (
              <div>
                <label htmlFor="cnamFollowupDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de suivi *
                </label>
                <input
                  type="date"
                  id="cnamFollowupDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  value={newPayment.cnamFollowupDate || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, cnamFollowupDate: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Period Coverage */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-3">Période couverte par ce paiement</h4>
        <p className="text-sm text-blue-700 mb-3">
          Cette période indique pour quelle durée ce paiement couvre la location de l&apos;élément.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="periodStartDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de début de période
            </label>
            <input
              type="date"
              id="periodStartDate"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={newPayment.periodStartDate}
              onChange={(e) => setNewPayment({ ...newPayment, periodStartDate: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="periodEndDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin de période
            </label>
            <input
              type="date"
              id="periodEndDate"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={newPayment.periodEndDate}
              min={newPayment.periodStartDate}
              onChange={(e) => setNewPayment({ ...newPayment, periodEndDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optionnel)
        </label>
        <textarea
          id="paymentNotes"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          value={newPayment.notes || ""}
          onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
          placeholder="Notes sur ce paiement..."
        />
      </div>

      <button
        type="button"
        onClick={handleAddPayment}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {editMode ? 'Modifier le paiement' : 'Ajouter le paiement'}
      </button>
    </div>
  );
} 