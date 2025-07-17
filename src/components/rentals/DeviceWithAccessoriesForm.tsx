"use client";

import { useState } from "react";
import { SALETYPE } from "@prisma/client";
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

type LinkedAccessory = {
  id: string;
  name: string;
  model: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isFree: boolean;
  notes?: string;
  payments: PaymentEntry[];
};

type DeviceWithAccessories = {
  // Device data
  deviceData: {
    name: string;
    model: string;
    serialNumber: string;
  };
  deviceQuantity: number;
  deviceUnitPrice: number;
  deviceTotalPrice: number;
  devicePayments: PaymentEntry[];
  
  // Linked accessories
  linkedAccessories: LinkedAccessory[];
  
  // Common fields
  startDate: string;
  endDate: string;
  notes?: string;
};

interface DeviceWithAccessoriesFormProps {
  onAddDeviceWithAccessories: (data: DeviceWithAccessories) => void;
  defaultStartDate: string;
  defaultEndDate: string;
}

export default function DeviceWithAccessoriesForm({ 
  onAddDeviceWithAccessories, 
  defaultStartDate, 
  defaultEndDate 
}: DeviceWithAccessoriesFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deviceData, setDeviceData] = useState({
    name: '',
    model: '',
    serialNumber: ''
  });
  const [deviceQuantity, setDeviceQuantity] = useState(1);
  const [deviceUnitPrice, setDeviceUnitPrice] = useState(0);
  const [devicePayments, setDevicePayments] = useState<PaymentEntry[]>([]);
  const [linkedAccessories, setLinkedAccessories] = useState<LinkedAccessory[]>([]);
  const [startDate, setStartDate] = useState(defaultStartDate || new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(defaultEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [notes, setNotes] = useState('');

  // New accessory form state
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  const [newAccessory, setNewAccessory] = useState<Omit<LinkedAccessory, 'id' | 'totalPrice'>>({
    name: '',
    model: '',
    quantity: 1,
    unitPrice: 0,
    isFree: false,
    payments: []
  });

  const deviceTotalPrice = deviceQuantity * deviceUnitPrice;

  const handleDeviceQuantityChange = (quantity: number) => {
    setDeviceQuantity(quantity);
  };

  const handleDeviceUnitPriceChange = (unitPrice: number) => {
    setDeviceUnitPrice(unitPrice);
  };

  const handleAddDevicePayment = (payment: PaymentEntry) => {
    setDevicePayments([...devicePayments, payment]);
  };

  const handleRemoveDevicePayment = (index: number) => {
    setDevicePayments(devicePayments.filter((_, i) => i !== index));
  };

  const handleAccessoryQuantityChange = (quantity: number) => {
    setNewAccessory({
      ...newAccessory,
      quantity
    });
  };

  const handleAccessoryUnitPriceChange = (unitPrice: number) => {
    setNewAccessory({
      ...newAccessory,
      unitPrice
    });
  };

  const handleAddAccessoryPayment = (payment: PaymentEntry) => {
    setNewAccessory({
      ...newAccessory,
      payments: [...newAccessory.payments, payment]
    });
  };

  const handleRemoveAccessoryPayment = (index: number) => {
    setNewAccessory({
      ...newAccessory,
      payments: newAccessory.payments.filter((_, i) => i !== index)
    });
  };

  const handleAddAccessory = () => {
    if (!newAccessory.name || !newAccessory.model) {
      alert("Veuillez remplir le nom et le modèle de l'accessoire");
      return;
    }

    if (newAccessory.quantity <= 0) {
      alert("La quantité doit être supérieure à 0");
      return;
    }

    if (!newAccessory.isFree && newAccessory.unitPrice <= 0) {
      alert("Le prix unitaire doit être supérieur à 0 pour un accessoire payant");
      return;
    }

    if (!newAccessory.isFree && newAccessory.payments.length === 0) {
      alert("Veuillez ajouter au moins un paiement pour cet accessoire payant");
      return;
    }

    const totalPrice = newAccessory.isFree ? 0 : newAccessory.quantity * newAccessory.unitPrice;
    
    if (!newAccessory.isFree) {
      const totalPaid = newAccessory.payments.reduce((sum, payment) => sum + payment.amount, 0);
      if (totalPaid > totalPrice) {
        alert("Le total des paiements ne peut pas dépasser le prix total de l'accessoire");
        return;
      }
    }

    const accessoryToAdd: LinkedAccessory = {
      ...newAccessory,
      id: Date.now().toString(),
      totalPrice,
      unitPrice: newAccessory.isFree ? 0 : newAccessory.unitPrice,
      payments: newAccessory.isFree ? [] : newAccessory.payments
    };

    setLinkedAccessories([...linkedAccessories, accessoryToAdd]);
    
    // Reset accessory form
    setNewAccessory({
      name: '',
      model: '',
      quantity: 1,
      unitPrice: 0,
      isFree: false,
      payments: []
    });
    setShowAccessoryForm(false);
  };

  const handleRemoveAccessory = (accessoryId: string) => {
    setLinkedAccessories(linkedAccessories.filter(acc => acc.id !== accessoryId));
  };

  const handleSubmit = () => {
    // Validate device data
    if (!deviceData.name || !deviceData.model || !deviceData.serialNumber) {
      alert("Veuillez remplir tous les champs requis pour l'appareil");
      return;
    }

    if (deviceQuantity <= 0 || deviceUnitPrice <= 0) {
      alert("La quantité et le prix unitaire de l'appareil doivent être supérieurs à 0");
      return;
    }

    if (devicePayments.length === 0) {
      alert("Veuillez ajouter au moins un paiement pour l'appareil");
      return;
    }

    // Validate device payments
    const deviceTotalPaid = devicePayments.reduce((sum, payment) => sum + payment.amount, 0);
    if (deviceTotalPaid > deviceTotalPrice) {
      alert("Le total des paiements de l'appareil ne peut pas dépasser son prix total");
      return;
    }

    const deviceWithAccessories: DeviceWithAccessories = {
      deviceData,
      deviceQuantity,
      deviceUnitPrice,
      deviceTotalPrice,
      devicePayments,
      linkedAccessories,
      startDate,
      endDate,
      notes
    };

    onAddDeviceWithAccessories(deviceWithAccessories);
    
    // Reset form
    setDeviceData({ name: '', model: '', serialNumber: '' });
    setDeviceQuantity(1);
    setDeviceUnitPrice(0);
    setDevicePayments([]);
    setLinkedAccessories([]);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setNotes('');
    setIsExpanded(false);
  };

  const deviceTotalPaid = devicePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const deviceOutstandingBalance = deviceTotalPrice - deviceTotalPaid;

  const accessoryTotalPrice = linkedAccessories.reduce((sum, acc) => sum + acc.totalPrice, 0);
  const accessoryTotalPaid = linkedAccessories.reduce((sum, acc) => 
    sum + acc.payments.reduce((paySum, payment) => paySum + payment.amount, 0), 0
  );

  const grandTotal = deviceTotalPrice + accessoryTotalPrice;
  const grandTotalPaid = deviceTotalPaid + accessoryTotalPaid;
  const grandOutstandingBalance = grandTotal - grandTotalPaid;

  return (
    <div className="mb-6 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-blue-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Ajouter un appareil avec accessoires
          </h3>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800"
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
          <div className="mt-4 space-y-6">
            {/* Device Information */}
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-blue-700 mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Informations de l&apos;appareil
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l&apos;appareil
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={deviceData.name}
                    onChange={(e) => setDeviceData({ ...deviceData, name: e.target.value })}
                    placeholder="Ex: CPAP ResMed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={deviceData.model}
                    onChange={(e) => setDeviceData({ ...deviceData, model: e.target.value })}
                    placeholder="Ex: AirSense 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de série
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={deviceData.serialNumber}
                    onChange={(e) => setDeviceData({ ...deviceData, serialNumber: e.target.value })}
                    placeholder="Ex: 12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={deviceQuantity}
                    onChange={(e) => handleDeviceQuantityChange(parseInt(e.target.value) || 1)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={deviceUnitPrice}
                    onChange={(e) => handleDeviceUnitPriceChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-md mb-4">
                <p className="text-sm font-medium text-blue-800">
                  Prix total de l&apos;appareil: {deviceTotalPrice.toFixed(2)} TND
                </p>
              </div>

              {/* Device Payments */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Paiements de l&apos;appareil</h5>
                {devicePayments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {devicePayments.map((payment, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                        <span className="text-sm">
                          {payment.method} - {payment.amount.toFixed(2)} TND
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDevicePayment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <PaymentForm
                  onAddPayment={handleAddDevicePayment}
                  totalAmount={deviceTotalPrice}
                  compact={true}
                />
                {deviceOutstandingBalance > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      Solde restant: {deviceOutstandingBalance.toFixed(2)} TND
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Accessories */}
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold text-green-700 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Accessoires liés ({linkedAccessories.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAccessoryForm(!showAccessoryForm)}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  {showAccessoryForm ? 'Annuler' : 'Ajouter accessoire'}
                </button>
              </div>

              {/* Existing Accessories */}
              {linkedAccessories.length > 0 && (
                <div className="space-y-2 mb-4">
                  {linkedAccessories.map((accessory) => (
                    <div key={accessory.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{accessory.name}</span>
                          <span className="text-sm text-gray-600">({accessory.model})</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            accessory.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {accessory.isFree ? 'Gratuit' : 'Payant'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Qté: {accessory.quantity} • Prix: {accessory.totalPrice.toFixed(2)} TND
                          {!accessory.isFree && (
                            <span className="ml-2">
                              • Payé: {accessory.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} TND
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAccessory(accessory.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Accessory Form */}
              {showAccessoryForm && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Nouvel accessoire</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l&apos;accessoire
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={newAccessory.name}
                        onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
                        placeholder="Ex: Masque nasal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modèle
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={newAccessory.model}
                        onChange={(e) => setNewAccessory({ ...newAccessory, model: e.target.value })}
                        placeholder="Ex: Swift FX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={newAccessory.quantity}
                        onChange={(e) => handleAccessoryQuantityChange(parseInt(e.target.value) || 1)}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        value={newAccessory.unitPrice}
                        onChange={(e) => handleAccessoryUnitPriceChange(parseFloat(e.target.value) || 0)}
                        disabled={newAccessory.isFree}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAccessory.isFree}
                          onChange={(e) => setNewAccessory({ 
                            ...newAccessory, 
                            isFree: e.target.checked,
                            unitPrice: e.target.checked ? 0 : newAccessory.unitPrice,
                            payments: e.target.checked ? [] : newAccessory.payments
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Accessoire gratuit</span>
                      </label>
                    </div>
                  </div>

                  {!newAccessory.isFree && (
                    <div className="mb-4">
                      <div className="p-3 bg-green-50 rounded-md mb-3">
                        <p className="text-sm font-medium text-green-800">
                          Prix total: {(newAccessory.quantity * newAccessory.unitPrice).toFixed(2)} TND
                        </p>
                      </div>
                      
                      <h6 className="text-sm font-semibold text-gray-700 mb-2">Paiements</h6>
                      {newAccessory.payments.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {newAccessory.payments.map((payment, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded-md">
                              <span className="text-sm">
                                {payment.method} - {payment.amount.toFixed(2)} TND
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAccessoryPayment(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <PaymentForm
                        onAddPayment={handleAddAccessoryPayment}
                        totalAmount={newAccessory.quantity * newAccessory.unitPrice}
                        compact={true}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      value={newAccessory.notes || ''}
                      onChange={(e) => setNewAccessory({ ...newAccessory, notes: e.target.value })}
                      placeholder="Notes sur cet accessoire..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccessoryForm(false);
                        setNewAccessory({
                          name: '',
                          model: '',
                          quantity: 1,
                          unitPrice: 0,
                          isFree: false,
                          payments: []
                        });
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleAddAccessory}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes générales
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur cette location..."
              />
            </div>

            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="text-md font-semibold text-indigo-700 mb-3">Résumé</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{grandTotal.toFixed(2)} TND</div>
                  <div className="text-sm text-gray-600">Total général</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{grandTotalPaid.toFixed(2)} TND</div>
                  <div className="text-sm text-gray-600">Total payé</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${grandOutstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {grandOutstandingBalance.toFixed(2)} TND
                  </div>
                  <div className="text-sm text-gray-600">Solde restant</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter l&apos;appareil avec accessoires
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { DeviceWithAccessories, LinkedAccessory }; 