"use client";

import { useState } from "react";

type DeviceItem = {
  type: "DEVICE";
  name: string;
  model: string;
  serialNumber: string;
  quantity: number;
};

interface DeviceFormProps {
  onAddDevice: (device: Omit<DeviceItem, "type" | "quantity">) => void;
}

export default function DeviceForm({ onAddDevice }: DeviceFormProps) {
  const [newDevice, setNewDevice] = useState({ name: "", model: "", serialNumber: "" });

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.model || !newDevice.serialNumber) return;
    
    onAddDevice({
      name: newDevice.name,
      model: newDevice.model,
      serialNumber: newDevice.serialNumber,
    });
    
    // Reset form
    setNewDevice({ name: "", model: "", serialNumber: "" });
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
      <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        Ajouter un appareil
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l&apos;appareil
          </label>
          <input
            type="text"
            id="deviceName"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newDevice.name}
            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
            placeholder="Ex: CPAP AUTO YUWELL"
          />
        </div>
        <div>
          <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700 mb-1">
            Modèle
          </label>
          <input
            type="text"
            id="deviceModel"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newDevice.model}
            onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
            placeholder="Ex: YH-680"
          />
        </div>
        <div>
          <label htmlFor="deviceSerial" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de série
          </label>
          <input
            type="text"
            id="deviceSerial"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={newDevice.serialNumber}
            onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
            placeholder="Ex: YH-680A-25000"
          />
        </div>
      </div>
      <button
        type="button"
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleAddDevice}
        disabled={!newDevice.name || !newDevice.model || !newDevice.serialNumber}
      >
        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter l&apos;appareil
      </button>
    </div>
  );
} 