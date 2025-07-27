"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SALETYPE } from "@prisma/client";
import { RentalAccessory } from "../simple/AccessoriesSection";
import { PaymentInfo, PaymentAlert } from "../simple/PaymentsSection";
import { EnhancedRentalDevice } from "./types";
import { DeviceCard } from "./DeviceCard";

interface DevicesSectionProps {
  devices: EnhancedRentalDevice[];
  addDevice: () => void;
  updateDevice: (deviceId: string, field: keyof EnhancedRentalDevice, value: any) => void;
  removeDevice: (deviceId: string) => void;
  addAccessoryToDevice: (deviceId: string) => void;
  updateDeviceAccessory: (deviceId: string, accessoryId: string, field: keyof RentalAccessory, value: any) => void;
  removeAccessoryFromDevice: (deviceId: string, accessoryId: string) => void;
  addPaymentToDevice: (deviceId: string) => void;
  updateDevicePayment: (deviceId: string, paymentId: string, field: keyof PaymentInfo, value: any) => void;
  removePaymentFromDevice: (deviceId: string, paymentId: string) => void;
  addAlertToPayment: (deviceId: string, paymentId: string) => void;
  updatePaymentAlert: (deviceId: string, paymentId: string, alertId: string, field: keyof PaymentAlert, value: string) => void;
  removeAlertFromPayment: (deviceId: string, paymentId: string, alertId: string) => void;
  getPaymentTypeLabel: (type: SALETYPE) => string;
  calculateCnamDuration: (debutDate: string, endDate: string) => number;
}

export function DevicesSection({
  devices,
  addDevice,
  updateDevice,
  removeDevice,
  addAccessoryToDevice,
  updateDeviceAccessory,
  removeAccessoryFromDevice,
  addPaymentToDevice,
  updateDevicePayment,
  removePaymentFromDevice,
  addAlertToPayment,
  updatePaymentAlert,
  removeAlertFromPayment,
  getPaymentTypeLabel,
  calculateCnamDuration,
}: DevicesSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Appareils et Détails</h3>
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
          Aucun appareil ajouté. Commencez par ajouter un appareil.
        </p>
      ) : (
        <div className="space-y-8">
          {devices.map((device, deviceIndex) => (
            <DeviceCard
              key={device.id}
              device={device}
              deviceIndex={deviceIndex}
              updateDevice={updateDevice}
              removeDevice={removeDevice}
              addAccessoryToDevice={addAccessoryToDevice}
              updateDeviceAccessory={updateDeviceAccessory}
              removeAccessoryFromDevice={removeAccessoryFromDevice}
              addPaymentToDevice={addPaymentToDevice}
              updateDevicePayment={updateDevicePayment}
              removePaymentFromDevice={removePaymentFromDevice}
              addAlertToPayment={addAlertToPayment}
              updatePaymentAlert={updatePaymentAlert}
              removeAlertFromPayment={removeAlertFromPayment}
              getPaymentTypeLabel={getPaymentTypeLabel}
              calculateCnamDuration={calculateCnamDuration}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
