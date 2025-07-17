"use client";

import { useState } from "react";
import { SALETYPE, RENTAL_ITEM_TYPE } from "@prisma/client";
import PaymentForm from "./PaymentForm";

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

type RentalItem = {
  id?: string;
  itemType: RENTAL_ITEM_TYPE;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  // Device or Accessory details
  deviceData?: {
    name: string;
    model: string;
    serialNumber: string;
  };
  accessoryData?: {
    name: string;
    model: string;
  };
  payments: PaymentEntry[];
};

interface RentalItemFormProps {
  onAddRentalItem: (item: RentalItem) => void;
  defaultStartDate: string;
  defaultEndDate: string;
}

export default function RentalItemForm({ 
  onAddRentalItem, 
  defaultStartDate, 
  defaultEndDate 
}: RentalItemFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newItem, setNewItem] = useState<RentalItem>({
    itemType: RENTAL_ITEM_TYPE.DEVICE,
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    startDate: defaultStartDate || new Date().toISOString().split("T")[0],
    endDate: defaultEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    payments: []
  });

  const handleItemTypeChange = (itemType: RENTAL_ITEM_TYPE) => {
    setNewItem({
      ...newItem,
      itemType,
      deviceData: itemType === RENTAL_ITEM_TYPE.DEVICE ? { name: '', model: '', serialNumber: '' } : undefined,
      accessoryData: itemType === RENTAL_ITEM_TYPE.ACCESSORY ? { name: '', model: '' } : undefined,
    });
  };

  const handleQuantityChange = (quantity: number) => {
    const totalPrice = quantity * newItem.unitPrice;
    setNewItem({
      ...newItem,
      quantity,
      totalPrice
    });
  };

  const handleUnitPriceChange = (unitPrice: number) => {
    const totalPrice = newItem.quantity * unitPrice;
    setNewItem({
      ...newItem,
      unitPrice,
      totalPrice
    });
  };

  const handleAddPayment = (payment: PaymentEntry) => {
    setNewItem({
      ...newItem,
      payments: [...newItem.payments, payment]
    });
  };

  const handleRemovePayment = (index: number) => {
    setNewItem({
      ...newItem,
      payments: newItem.payments.filter((_, i) => i !== index)
    });
  };

  const handleAddItem = () => {
    // Validate required fields
    if (newItem.itemType === RENTAL_ITEM_TYPE.DEVICE) {
      if (!newItem.deviceData?.name || !newItem.deviceData?.model || !newItem.deviceData?.serialNumber) {
        alert("Veuillez remplir tous les champs requis pour l'appareil");
        return;
      }
    } else {
      if (!newItem.accessoryData?.name || !newItem.accessoryData?.model) {
        alert("Veuillez remplir tous les champs requis pour l'accessoire");
        return;
      }
    }

    if (newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      alert("La quantité et le prix unitaire doivent être supérieurs à 0");
      return;
    }

    if (newItem.payments.length === 0) {
      alert("Veuillez ajouter au moins un paiement pour cet élément");
      return;
    }

    // Validate that total payments don't exceed total price
    const totalPaid = newItem.payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid > newItem.totalPrice) {
      alert("Le total des paiements ne peut pas dépasser le prix total de l'élément");
      return;
    }

    onAddRentalItem(newItem);
    
    // Reset form
    setNewItem({
      itemType: RENTAL_ITEM_TYPE.DEVICE,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      payments: []
    });
    setIsExpanded(false);
  };

  const totalPaid = newItem.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingBalance = newItem.totalPrice - totalPaid;

  return (
    <div className="mb-6 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-purple-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un élément de location
          </h3>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-800"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Item Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d&apos;élément
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="itemType"
                    value={RENTAL_ITEM_TYPE.DEVICE}
                    checked={newItem.itemType === RENTAL_ITEM_TYPE.DEVICE}
                    onChange={() => handleItemTypeChange(RENTAL_ITEM_TYPE.DEVICE)}
                    className="mr-2"
                  />
                  Appareil
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="itemType"
                    value={RENTAL_ITEM_TYPE.ACCESSORY}
                    checked={newItem.itemType === RENTAL_ITEM_TYPE.ACCESSORY}
                    onChange={() => handleItemTypeChange(RENTAL_ITEM_TYPE.ACCESSORY)}
                    className="mr-2"
                  />
                  Accessoire
                </label>
              </div>
            </div>

            {/* Device Details */}
            {newItem.itemType === RENTAL_ITEM_TYPE.DEVICE && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;appareil
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.deviceData?.name || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      deviceData: { ...newItem.deviceData!, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.deviceData?.model || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      deviceData: { ...newItem.deviceData!, model: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de série
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.deviceData?.serialNumber || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      deviceData: { ...newItem.deviceData!, serialNumber: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Accessory Details */}
            {newItem.itemType === RENTAL_ITEM_TYPE.ACCESSORY && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;accessoire
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={newItem.accessoryData?.name || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      accessoryData: { ...newItem.accessoryData!, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={newItem.accessoryData?.model || ''}
                    onChange={(e) => setNewItem({
                      ...newItem,
                      accessoryData: { ...newItem.accessoryData!, model: e.target.value }
                    })}
                  />
                </div>
              </div>
            )}

            {/* Quantity, Pricing, and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={newItem.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire (TND)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={newItem.unitPrice}
                  onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={newItem.startDate}
                  onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={newItem.endDate}
                  min={newItem.startDate}
                  onChange={(e) => setNewItem({ ...newItem, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center text-sm">
                <span>Prix total:</span>
                <span className="font-medium">{newItem.totalPrice.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Total payé:</span>
                <span className="font-medium text-green-600">{totalPaid.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Restant à payer:</span>
                <span className={`font-medium ${outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {outstandingBalance.toFixed(2)} TND
                </span>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm 
              onAddPayment={handleAddPayment}
              itemStartDate={newItem.startDate}
              itemEndDate={newItem.endDate}
            />

            {/* Payment List */}
            {newItem.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Paiements configurés:</h4>
                <div className="space-y-2">
                  {newItem.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {payment.method} - {payment.amount.toFixed(2)} TND
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.paymentDate && `Date: ${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}`}
                          {payment.periodStartDate && payment.periodEndDate && (
                            ` | Période: ${new Date(payment.periodStartDate).toLocaleDateString('fr-FR')} - ${new Date(payment.periodEndDate).toLocaleDateString('fr-FR')}`
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePayment(index)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                value={newItem.notes || ''}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Notes sur cet élément..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Ajouter l&apos;élément
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 