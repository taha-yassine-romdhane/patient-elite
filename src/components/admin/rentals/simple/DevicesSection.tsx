"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export interface RentalDevice {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  notes: string;
}

interface DevicesSectionProps {
  devices: RentalDevice[];
  onDevicesChange: (devices: RentalDevice[]) => void;
}

export default function DevicesSection({ devices, onDevicesChange }: DevicesSectionProps) {
  const addDevice = () => {
    const newDevice: RentalDevice = {
      id: Date.now().toString(),
      name: "",
      model: "",
      serialNumber: "",
      notes: ""
    };
    onDevicesChange([...devices, newDevice]);
  };

  const updateDevice = (id: string, field: keyof RentalDevice, value: string | number) => {
    const updatedDevices = devices.map(device => 
      device.id === id ? { ...device, [field]: value } : device
    );
    onDevicesChange(updatedDevices);
  };

  const removeDevice = (id: string) => {
    const updatedDevices = devices.filter(d => d.id !== id);
    onDevicesChange(updatedDevices);
  };


  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Appareils</h3>
          {devices.length > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {devices.length} appareil{devices.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Button type="button" onClick={addDevice} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un appareil
        </Button>
      </div>
      
      {devices.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Aucun appareil ajouté
        </p>
      ) : (
        <div className="space-y-4">
          {devices.map((device, index) => (
            <div key={device.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium">Appareil {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDevice(device.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label>Nom *</Label>
                  <Input
                    value={device.name}
                    onChange={(e) => updateDevice(device.id, 'name', e.target.value)}
                    placeholder="ex: CPAP"
                    required
                  />
                </div>
                <div>
                  <Label>Modèle</Label>
                  <Input
                    value={device.model}
                    onChange={(e) => updateDevice(device.id, 'model', e.target.value)}
                    placeholder="ex: AirSense 10"
                  />
                </div>
                <div>
                  <Label>Numéro de série</Label>
                  <Input
                    value={device.serialNumber}
                    onChange={(e) => updateDevice(device.id, 'serialNumber', e.target.value)}
                    placeholder="ex: SN123456"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <Label>Notes</Label>
                <Input
                  value={device.notes}
                  onChange={(e) => updateDevice(device.id, 'notes', e.target.value)}
                  placeholder="Notes spécifiques à cet appareil..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}