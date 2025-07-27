"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { RentalAccessory } from "../simple/AccessoriesSection";
import { EnhancedRentalDevice } from "./types";

interface DeviceAccessoriesProps {
  device: EnhancedRentalDevice;
  addAccessoryToDevice: (deviceId: string) => void;
  updateDeviceAccessory: (deviceId: string, accessoryId: string, field: keyof RentalAccessory, value: any) => void;
  removeAccessoryFromDevice: (deviceId: string, accessoryId: string) => void;
}

export function DeviceAccessories({
  device,
  addAccessoryToDevice,
  updateDeviceAccessory,
  removeAccessoryFromDevice,
}: DeviceAccessoriesProps) {
  return (
    <div className="mb-6 bg-green-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-medium text-green-700">Accessoires pour cet appareil</h5>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAccessoryToDevice(device.id)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter accessoire
        </Button>
      </div>
      
      {device.accessories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucun accessoire ajouté pour cet appareil
        </p>
      ) : (
        <div className="space-y-3">
          {device.accessories.map((accessory, accIndex) => (
            <div key={accessory.id} className="border border-green-200 rounded p-3 bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium flex items-center space-x-2">
                  <span>Accessoire {accIndex + 1}</span>
                  {accessory.isFree && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                      GRATUIT
                    </span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAccessoryFromDevice(device.id, accessory.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm">Nom *</Label>
                  <Input
                    value={accessory.name || ""}
                    onChange={(e) => updateDeviceAccessory(device.id, accessory.id, 'name', e.target.value)}
                    placeholder="ex: Masque nasal"
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Modèle</Label>
                  <Input
                    value={accessory.model || ""}
                    onChange={(e) => updateDeviceAccessory(device.id, accessory.id, 'model', e.target.value)}
                    placeholder="ex: AirFit N20"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`free-${accessory.id}`}
                    checked={accessory.isFree}
                    onChange={(e) => updateDeviceAccessory(device.id, accessory.id, 'isFree', e.target.checked)}
                  />
                  <Label htmlFor={`free-${accessory.id}`} className="text-sm">Gratuit</Label>
                </div>
              </div>
              <div className="mt-2">
                <Label className="text-sm">Notes</Label>
                <Input
                  value={accessory.notes || ""}
                  onChange={(e) => updateDeviceAccessory(device.id, accessory.id, 'notes', e.target.value)}
                  placeholder="Notes..."
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
