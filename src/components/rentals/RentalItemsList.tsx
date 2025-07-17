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

// Edit Rental Item Form Component
function EditRentalItemForm({ 
  item, 
  onSave, 
  onCancel 
}: {
  item: RentalItem;
  onSave: (item: RentalItem) => void;
  onCancel: () => void;
}) {
  const [editedItem, setEditedItem] = useState<RentalItem>(item);

  const handleItemTypeChange = (itemType: RENTAL_ITEM_TYPE) => {
    setEditedItem({
      ...editedItem,
      itemType,
      deviceData: itemType === RENTAL_ITEM_TYPE.DEVICE ? 
        (editedItem.deviceData || { name: '', model: '', serialNumber: '' }) : undefined,
      accessoryData: itemType === RENTAL_ITEM_TYPE.ACCESSORY ? 
        (editedItem.accessoryData || { name: '', model: '' }) : undefined,
    });
  };

  const handleQuantityChange = (quantity: number) => {
    const totalPrice = quantity * editedItem.unitPrice;
    setEditedItem({
      ...editedItem,
      quantity,
      totalPrice
    });
  };

  const handleUnitPriceChange = (unitPrice: number) => {
    const totalPrice = editedItem.quantity * unitPrice;
    setEditedItem({
      ...editedItem,
      unitPrice,
      totalPrice
    });
  };

  const handleSave = () => {
    // Validate required fields
    if (editedItem.itemType === RENTAL_ITEM_TYPE.DEVICE) {
      if (!editedItem.deviceData?.name || !editedItem.deviceData?.model) {
        alert('Veuillez remplir tous les champs requis pour l\'appareil');
        return;
      }
    } else if (editedItem.itemType === RENTAL_ITEM_TYPE.ACCESSORY) {
      if (!editedItem.accessoryData?.name || !editedItem.accessoryData?.model) {
        alert('Veuillez remplir tous les champs requis pour l\'accessoire');
        return;
      }
    }

    if (editedItem.quantity <= 0 || editedItem.unitPrice < 0) {
      alert('Veuillez vérifier la quantité et le prix');
      return;
    }

    onSave(editedItem);
  };

  return (
    <div className="space-y-6">
      {/* Item Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type d&apos;élément
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="itemType"
              value={RENTAL_ITEM_TYPE.DEVICE}
              checked={editedItem.itemType === RENTAL_ITEM_TYPE.DEVICE}
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
              checked={editedItem.itemType === RENTAL_ITEM_TYPE.ACCESSORY}
              onChange={() => handleItemTypeChange(RENTAL_ITEM_TYPE.ACCESSORY)}
              className="mr-2"
            />
            Accessoire
          </label>
        </div>
      </div>

      {/* Device Fields */}
      {editedItem.itemType === RENTAL_ITEM_TYPE.DEVICE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l&apos;appareil
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={editedItem.deviceData?.name || ''}
              onChange={(e) => setEditedItem({
                ...editedItem,
                deviceData: { ...editedItem.deviceData!, name: e.target.value }
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
              value={editedItem.deviceData?.model || ''}
              onChange={(e) => setEditedItem({
                ...editedItem,
                deviceData: { ...editedItem.deviceData!, model: e.target.value }
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
              value={editedItem.deviceData?.serialNumber || ''}
              onChange={(e) => setEditedItem({
                ...editedItem,
                deviceData: { ...editedItem.deviceData!, serialNumber: e.target.value }
              })}
            />
          </div>
        </div>
      )}

      {/* Accessory Fields */}
      {editedItem.itemType === RENTAL_ITEM_TYPE.ACCESSORY && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l&apos;accessoire
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              value={editedItem.accessoryData?.name || ''}
              onChange={(e) => setEditedItem({
                ...editedItem,
                accessoryData: { ...editedItem.accessoryData!, name: e.target.value }
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
              value={editedItem.accessoryData?.model || ''}
              onChange={(e) => setEditedItem({
                ...editedItem,
                accessoryData: { ...editedItem.accessoryData!, model: e.target.value }
              })}
            />
          </div>
        </div>
      )}

      {/* Quantity, Price, and Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={editedItem.quantity}
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
            value={editedItem.unitPrice}
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
            value={editedItem.startDate}
            onChange={(e) => setEditedItem({ ...editedItem, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            value={editedItem.endDate}
            min={editedItem.startDate}
            onChange={(e) => setEditedItem({ ...editedItem, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Total Price Display */}
      <div className="p-4 bg-gray-50 rounded-md">
        <p className="text-lg font-semibold text-gray-800">
          Prix total: {editedItem.totalPrice.toFixed(2)} TND
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          value={editedItem.notes || ''}
          onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
          placeholder="Notes additionnelles..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

interface RentalItemsListProps {
  rentalItems: RentalItem[];
  onEditItem: (index: number, updatedItem: RentalItem) => void;
  onRemoveItem: (index: number) => void;
  onAddPaymentToItem: (itemIndex: number, payment: PaymentEntry) => void;
  onRemovePaymentFromItem: (itemIndex: number, paymentIndex: number) => void;
  onEditPayment: (itemIndex: number, paymentIndex: number, updatedPayment: PaymentEntry) => void;
}

export default function RentalItemsList({
  rentalItems,
  onEditItem,
  onRemoveItem,
  onAddPaymentToItem,
  onRemovePaymentFromItem,
  onEditPayment
}: RentalItemsListProps) {
  const [editingItem, setEditingItem] = useState<{
    index: number;
    item: RentalItem;
  } | null>(null);
  const [editingPayment, setEditingPayment] = useState<{
    itemIndex: number;
    paymentIndex: number;
    payment: PaymentEntry;
  } | null>(null);

  const handleEditItem = (index: number, updatedItem: RentalItem) => {
    onEditItem(index, updatedItem);
    setEditingItem(null);
  };

  const handleEditPayment = (itemIndex: number, paymentIndex: number, updatedPayment: PaymentEntry) => {
    onEditPayment(itemIndex, paymentIndex, updatedPayment);
    setEditingPayment(null);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Éléments individuels ({rentalItems.length})
      </h3>
      
      {rentalItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-slate-500 text-lg font-medium mb-2">Aucun élément de location</p>
          <p className="text-slate-400">Ajoutez des appareils ou accessoires à louer</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rentalItems.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.itemType === RENTAL_ITEM_TYPE.DEVICE 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.itemType === RENTAL_ITEM_TYPE.DEVICE ? 'Appareil' : 'Accessoire'}
                      </span>
                      <h4 className="font-semibold text-slate-800 ml-3 text-lg">
                        {item.deviceData?.name || item.accessoryData?.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-slate-600">Modèle</p>
                        <p className="text-base text-slate-800">{item.deviceData?.model || item.accessoryData?.model}</p>
                      </div>
                      {item.deviceData?.serialNumber && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-slate-600">Numéro de série</p>
                          <p className="text-base text-slate-800">{item.deviceData.serialNumber}</p>
                        </div>
                      )}
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-slate-600">Quantité</p>
                        <p className="text-base text-slate-800">{item.quantity}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-slate-600">Prix unitaire</p>
                        <p className="text-base text-slate-800">{item.unitPrice.toFixed(2)} TND</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-slate-600">Total</p>
                        <p className="text-base font-bold text-slate-800">{item.totalPrice.toFixed(2)} TND</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-slate-600">Période</p>
                        <p className="text-base text-slate-800">
                          {new Date(item.startDate).toLocaleDateString('fr-FR')} - {new Date(item.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={() => setEditingItem({ index, item })}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Modifier l'élément"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Supprimer l'élément"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Payments Section */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-semibold text-slate-700 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Paiements ({item.payments.length})
                    </h5>
                    <div className="text-sm text-slate-600">
                      Payé: {item.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} TND / {item.totalPrice.toFixed(2)} TND
                    </div>
                  </div>

                  {item.payments.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-amber-800 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Aucun paiement configuré pour cet élément
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {item.payments.map((payment, paymentIndex) => (
                        <div key={paymentIndex} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.method === 'CASH' ? 'bg-green-100 text-green-800' :
                                payment.method === 'CHEQUE' ? 'bg-blue-100 text-blue-800' :
                                payment.method === 'TRAITE' ? 'bg-purple-100 text-purple-800' :
                                payment.method === 'CNAM' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.method}
                              </span>
                              <span className="font-semibold text-slate-800">
                                {payment.amount.toFixed(2)} TND
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mt-1">
                              {payment.paymentDate && `Date: ${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}`}
                              {payment.periodStartDate && payment.periodEndDate && (
                                ` | Période: ${new Date(payment.periodStartDate).toLocaleDateString('fr-FR')} - ${new Date(payment.periodEndDate).toLocaleDateString('fr-FR')}`
                              )}
                              {payment.notes && (
                                <div className="text-xs text-slate-500 mt-1">
                                  Note: {payment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              type="button"
                              onClick={() => setEditingPayment({ itemIndex: index, paymentIndex, payment })}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Modifier le paiement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemovePaymentFromItem(index, paymentIndex)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Supprimer le paiement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Payment Form */}
                  <PaymentForm
                    onAddPayment={(payment) => onAddPaymentToItem(index, payment)}
                    totalAmount={item.totalPrice}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Modifier le paiement</h3>
            <PaymentForm
              onAddPayment={(updatedPayment) => 
                handleEditPayment(editingPayment.itemIndex, editingPayment.paymentIndex, updatedPayment)
              }
              totalAmount={rentalItems[editingPayment.itemIndex].totalPrice}
              initialPayment={editingPayment.payment}
              editMode={true}
            />
            <button
              type="button"
              onClick={() => setEditingPayment(null)}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Modifier l&apos;élément</h3>
            <EditRentalItemForm
              item={editingItem.item}
              onSave={(updatedItem) => handleEditItem(editingItem.index, updatedItem)}
              onCancel={() => setEditingItem(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export type { RentalItem, PaymentEntry }; 