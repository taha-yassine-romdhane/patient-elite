"use client";

import { useState } from "react";

type AccessoryItem = {
  type: "ACCESSORY";
  name: string;
  model: string;
  quantity: number;
};

interface AccessoryFormProps {
  onAddAccessory: (accessory: Omit<AccessoryItem, "type">) => void;
}

export default function AccessoryForm({ onAddAccessory }: AccessoryFormProps) {
  const [newAccessory, setNewAccessory] = useState({ name: "", model: "", quantity: 1 });

  const handleAddAccessory = () => {
    if (!newAccessory.name || !newAccessory.model || newAccessory.quantity <= 0) return;
    
    onAddAccessory({
      name: newAccessory.name,
      model: newAccessory.model,
      quantity: newAccessory.quantity
    });
    
    // Reset form
    setNewAccessory({ name: "", model: "", quantity: 1 });
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
      <h3 className="text-lg font-medium text-green-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Ajouter un accessoire
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="accessoryName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l&apos;accessoire
          </label>
          <input
            type="text"
            id="accessoryName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Masque nasal"
            value={newAccessory.name}
            onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
          />
        </div>
        
        <div>
          <label htmlFor="accessoryModel" className="block text-sm font-medium text-gray-700 mb-1">
            Modèle
          </label>
          <input
            type="text"
            id="accessoryModel"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Resmed AirFit N30i"
            value={newAccessory.model}
            onChange={(e) => setNewAccessory({ ...newAccessory, model: e.target.value })}
          />
        </div>
        
        <div>
          <label htmlFor="accessoryQuantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantité
          </label>
          <input
            type="number"
            id="accessoryQuantity"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            value={newAccessory.quantity}
            onChange={(e) => setNewAccessory({ ...newAccessory, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleAddAccessory}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter l&apos;accessoire
      </button>
    </div>
  );
} 