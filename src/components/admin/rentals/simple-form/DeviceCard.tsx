"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SALETYPE } from "@prisma/client";
import { RentalAccessory } from "../simple/AccessoriesSection";
import { PaymentInfo, PaymentAlert } from "../simple/PaymentsSection";
import { EnhancedRentalDevice } from "./types";
import { DeviceDetails } from "./DeviceDetails";
import { DeviceAccessories } from "./DeviceAccessories";
import { DevicePayments } from "./DevicePayments";

interface DeviceCardProps {
  device: EnhancedRentalDevice;
  deviceIndex: number;
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

export function DeviceCard({
  device,
  deviceIndex,
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
}: DeviceCardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
      {/* Device Header */}
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-xl font-semibold text-gray-900">
          Appareil {deviceIndex + 1}
        </h4>
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

      <DeviceDetails device={device} updateDevice={updateDevice} />

      <DeviceAccessories
        device={device}
        addAccessoryToDevice={addAccessoryToDevice}
        updateDeviceAccessory={updateDeviceAccessory}
        removeAccessoryFromDevice={removeAccessoryFromDevice}
      />

      <DevicePayments
        device={device}
        addPaymentToDevice={addPaymentToDevice}
        updateDevicePayment={updateDevicePayment}
        removePaymentFromDevice={removePaymentFromDevice}
        addAlertToPayment={addAlertToPayment}
        updatePaymentAlert={updatePaymentAlert}
        removeAlertFromPayment={removeAlertFromPayment}
        getPaymentTypeLabel={getPaymentTypeLabel}
        calculateCnamDuration={calculateCnamDuration}
      />
    </div>
  );
}
