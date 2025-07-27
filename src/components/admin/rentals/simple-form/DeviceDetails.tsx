"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { EnhancedRentalDevice } from "./types";

interface DeviceDetailsProps {
  device: EnhancedRentalDevice;
  updateDevice: (deviceId: string, field: keyof EnhancedRentalDevice, value: any) => void;
}

export function DeviceDetails({ device, updateDevice }: DeviceDetailsProps) {
  return (
    <>
      {/* Device Details */}
      <div className="mb-6">
        <h5 className="font-medium mb-3 text-gray-700">Détails de l'appareil</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Nom *</Label>
            <Input
              value={device.name || ""}
              onChange={(e) => updateDevice(device.id, 'name', e.target.value)}
              placeholder="ex: CPAP"
              required
            />
          </div>
          <div>
            <Label>Modèle</Label>
            <Input
              value={device.model || ""}
              onChange={(e) => updateDevice(device.id, 'model', e.target.value)}
              placeholder="ex: AirSense 10"
            />
          </div>
          <div>
            <Label>Numéro de série</Label>
            <Input
              value={device.serialNumber || ""}
              onChange={(e) => updateDevice(device.id, 'serialNumber', e.target.value)}
              placeholder="ex: SN123456"
            />
          </div>
        </div>
        <div className="mt-3">
          <Label>Notes sur l'appareil</Label>
          <Input
            value={device.notes || ""}
            onChange={(e) => updateDevice(device.id, 'notes', e.target.value)}
            placeholder="Notes spécifiques à cet appareil..."
          />
        </div>
      </div>

      {/* Device Dates */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h5 className="font-medium mb-3 text-blue-700">Dates pour cet appareil</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <DatePicker
              label="Date de début *"
              value={device.startDate || ""}
              onChange={(value) => updateDevice(device.id, 'startDate', value)}
              placeholder="JJ/MM/AAAA"
              required
            />
          </div>
          <div>
            <DatePicker
              label="Date de fin prévue"
              value={device.endDate || ""}
              onChange={(value) => updateDevice(device.id, 'endDate', value)}
              placeholder="JJ/MM/AAAA"
            />
          </div>
          <div>
            <DatePicker
              label="Date de retour réelle"
              value={device.actualReturnDate || ""}
              onChange={(value) => updateDevice(device.id, 'actualReturnDate', value)}
              placeholder="JJ/MM/AAAA"
              disabled={false}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <Label>Statut</Label>
            <Select value={device.status || "PENDING"} onValueChange={(value) => updateDevice(device.id, 'status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="COMPLETED">Complétée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}
