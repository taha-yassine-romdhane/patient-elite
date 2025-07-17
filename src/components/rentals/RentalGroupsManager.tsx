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

type RentalGroup = {
  id: string;
  name: string;
  description?: string;
  items: RentalItem[];
  sharedPayments: PaymentEntry[];
  startDate: string;
  endDate: string;
  notes?: string;
  totalPrice?: number;
};

interface RentalGroupsManagerProps {
  rentalItems: RentalItem[];
  rentalGroups: RentalGroup[];
  onCreateGroup: (groupName: string, selectedItemIndices: number[], standaloneGroup?: RentalGroup) => void;
  onRemoveGroup: (groupIndex: number) => void;
  onAddSharedPaymentToGroup: (groupIndex: number, payment: PaymentEntry) => void;
}

export default function RentalGroupsManager({
  rentalItems,
  rentalGroups,
  onCreateGroup,
  onRemoveGroup,
  onAddSharedPaymentToGroup
}: RentalGroupsManagerProps) {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showStandaloneGroupForm, setShowStandaloneGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedItemsForGroup, setSelectedItemsForGroup] = useState<number[]>([]);
  
  // Standalone group form state
  const [standaloneGroup, setStandaloneGroup] = useState({
    name: "",
    description: "",
    totalPrice: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: ""
  });

  const handleCreateGroup = () => {
    if (selectedItemsForGroup.length === 0 || !newGroupName.trim()) return;

    onCreateGroup(newGroupName.trim(), selectedItemsForGroup);
    
    // Reset form
    setShowGroupForm(false);
    setNewGroupName("");
    setSelectedItemsForGroup([]);
  };

  const handleCreateStandaloneGroup = () => {
    if (!standaloneGroup.name.trim() || standaloneGroup.totalPrice <= 0) return;

    // Create a standalone group without individual items
    const newGroup: RentalGroup = {
      id: Date.now().toString(),
      name: standaloneGroup.name.trim(),
      description: standaloneGroup.description,
      items: [], // Empty items for standalone group
      sharedPayments: [],
      startDate: standaloneGroup.startDate,
      endDate: standaloneGroup.endDate,
      notes: standaloneGroup.notes,
      totalPrice: standaloneGroup.totalPrice
    };

    // We need to modify the parent component to handle standalone groups
    // For now, we'll call onCreateGroup with empty items
    onCreateGroup(standaloneGroup.name.trim(), [], newGroup);
    
    // Reset form
    setShowStandaloneGroupForm(false);
    setStandaloneGroup({
      name: "",
      description: "",
      totalPrice: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: ""
    });
  };

  const handleCancelGroupForm = () => {
    setShowGroupForm(false);
    setNewGroupName("");
    setSelectedItemsForGroup([]);
  };

  const handleCancelStandaloneGroupForm = () => {
    setShowStandaloneGroupForm(false);
    setStandaloneGroup({
      name: "",
      description: "",
      totalPrice: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Standalone Group Creation Form */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Créer un groupe de location
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Créez un groupe de location directement sans éléments individuels préalables.
        </p>
        
        {!showStandaloneGroupForm ? (
          <button
            type="button"
            onClick={() => setShowStandaloneGroupForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nouveau groupe
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du groupe *
              </label>
              <input
                type="text"
                value={standaloneGroup.name}
                onChange={(e) => setStandaloneGroup({...standaloneGroup, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Package CPAP complet"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={standaloneGroup.description}
                onChange={(e) => setStandaloneGroup({...standaloneGroup, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Description du groupe..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix total *
                </label>
                <input
                  type="number"
                  value={standaloneGroup.totalPrice}
                  onChange={(e) => setStandaloneGroup({...standaloneGroup, totalPrice: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  value={standaloneGroup.startDate}
                  onChange={(e) => setStandaloneGroup({...standaloneGroup, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin *
                </label>
                <input
                  type="date"
                  value={standaloneGroup.endDate}
                  onChange={(e) => setStandaloneGroup({...standaloneGroup, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={standaloneGroup.notes}
                onChange={(e) => setStandaloneGroup({...standaloneGroup, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Notes supplémentaires..."
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCreateStandaloneGroup}
                disabled={!standaloneGroup.name.trim() || standaloneGroup.totalPrice <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Créer le groupe
              </button>
              <button
                type="button"
                onClick={handleCancelStandaloneGroupForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Group Creation Form from Individual Items */}
      {rentalItems.length > 1 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Regrouper les éléments existants
          </h3>
          <p className="text-sm text-green-700 mb-4">
            Regroupez des éléments individuels pour partager des paiements ou les organiser ensemble.
          </p>
          
          {!showGroupForm ? (
            <button
              type="button"
              onClick={() => setShowGroupForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer un groupe
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ex: Équipement CPAP complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner les éléments
                </label>
                <div className="space-y-2">
                  {rentalItems.map((item, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItemsForGroup.includes(index)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItemsForGroup([...selectedItemsForGroup, index]);
                          } else {
                            setSelectedItemsForGroup(selectedItemsForGroup.filter(i => i !== index));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {item.deviceData?.name || item.accessoryData?.name} - {item.totalPrice.toFixed(2)} TND
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={selectedItemsForGroup.length === 0 || !newGroupName.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Créer le groupe
                </button>
                <button
                  type="button"
                  onClick={handleCancelGroupForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Groups */}
      {rentalGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Groupes de location
          </h3>
          <div className="space-y-4">
            {rentalGroups.map((group, groupIndex) => (
              <div key={group.id} className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-green-800 text-lg">{group.name}</h4>
                    <p className="text-sm text-green-600">
                      {group.items.length} élément(s) • 
                      Total: {group.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)} TND
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveGroup(groupIndex)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Group Items */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Éléments du groupe</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            item.itemType === RENTAL_ITEM_TYPE.DEVICE 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.itemType === RENTAL_ITEM_TYPE.DEVICE ? 'Appareil' : 'Accessoire'}
                          </span>
                          <p className="font-medium text-gray-800">
                            {item.deviceData?.name || item.accessoryData?.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.deviceData?.model || item.accessoryData?.model} • 
                          Qté: {item.quantity} • 
                          Prix: {item.totalPrice.toFixed(2)} TND
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.startDate).toLocaleDateString('fr-FR')} - {new Date(item.endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Payments */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Paiements partagés</h5>
                  {group.sharedPayments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucun paiement partagé</p>
                  ) : (
                    <div className="space-y-2">
                      {group.sharedPayments.map((payment, paymentIndex) => (
                        <div key={paymentIndex} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                          <div>
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
                              <p className="font-medium text-gray-800">
                                {payment.amount.toFixed(2)} TND
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {payment.paymentDate && `Date: ${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}`}
                              {payment.periodStartDate && payment.periodEndDate && (
                                ` | Période: ${new Date(payment.periodStartDate).toLocaleDateString('fr-FR')} - ${new Date(payment.periodEndDate).toLocaleDateString('fr-FR')}`
                              )}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                Note: {payment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <PaymentForm
                      onAddPayment={(payment) => onAddSharedPaymentToGroup(groupIndex, payment)}
                      totalAmount={group.items.reduce((sum, item) => sum + item.totalPrice, 0)}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Group Summary */}
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {group.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)} TND
                      </div>
                      <div className="text-sm text-gray-600">Total du groupe</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {(group.items.reduce((sum, item) => sum + item.payments.reduce((paySum, payment) => paySum + payment.amount, 0), 0) + 
                          group.sharedPayments.reduce((sum, payment) => sum + payment.amount, 0)).toFixed(2)} TND
                      </div>
                      <div className="text-sm text-gray-600">Total payé</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {(group.items.reduce((sum, item) => sum + item.totalPrice, 0) - 
                          group.items.reduce((sum, item) => sum + item.payments.reduce((paySum, payment) => paySum + payment.amount, 0), 0) - 
                          group.sharedPayments.reduce((sum, payment) => sum + payment.amount, 0)).toFixed(2)} TND
                      </div>
                      <div className="text-sm text-gray-600">Solde restant</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { RentalGroup }; 