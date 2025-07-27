"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, Plus, Trash2, Bell, AlertCircle, Calendar, Clock } from "lucide-react";
// Removed timeline components - using simple payments summary instead
import { Patient } from "@/types/rental";
import { SALETYPE } from "@prisma/client";

import { RentalAccessory } from "./simple/AccessoriesSection";
import { PaymentInfo, PaymentAlert } from "./simple/PaymentsSection";

interface SimpleRentalFormProps {
  patient: Patient;
  onBack: () => void;
}

// Enhanced Device interface to include everything per device
interface EnhancedRentalDevice {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  notes: string;
  // Device-specific dates
  startDate: string;
  endDate: string;
  // Removed daily rental pricing - client manages periods directly
  // Device-specific accessories
  accessories: RentalAccessory[];
  // Device-specific payments
  payments: PaymentInfo[];
  // Device status
  status: string;
  actualReturnDate: string;
}

export default function SimpleRentalForm({ patient, onBack }: SimpleRentalFormProps) {
  // Basic rental info (global)
  const [contractNumber, setContractNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Device-centered approach
  const [devices, setDevices] = useState<EnhancedRentalDevice[]>([]);

  // Device management functions
  const addDevice = () => {
    const newDevice: EnhancedRentalDevice = {
      id: Date.now().toString(),
      name: "",
      model: "",
      serialNumber: "",
      notes: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      accessories: [],
      payments: [],
      status: "PENDING",
      actualReturnDate: ""
    };
    setDevices([...devices, newDevice]);
  };

  const updateDevice = (deviceId: string, field: keyof EnhancedRentalDevice, value: any) => {
    setDevices(devices.map(device => 
      device.id === deviceId ? { ...device, [field]: value } : device
    ));
  };

  const removeDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
  };

  // Accessory management per device
  const addAccessoryToDevice = (deviceId: string) => {
    const newAccessory: RentalAccessory = {
      id: Date.now().toString(),
      name: "",
      model: "",
      isFree: true,
      notes: ""
    };
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, accessories: [...device.accessories, newAccessory] }
        : device
    ));
  };

  const updateDeviceAccessory = (deviceId: string, accessoryId: string, field: keyof RentalAccessory, value: any) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? {
            ...device, 
            accessories: device.accessories.map(acc => 
              acc.id === accessoryId ? { ...acc, [field]: value } : acc
            )
          }
        : device
    ));
  };

  const removeAccessoryFromDevice = (deviceId: string, accessoryId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, accessories: device.accessories.filter(acc => acc.id !== accessoryId) }
        : device
    ));
  };

  // Payment management per device
  const addPaymentToDevice = (deviceId: string) => {
    const newPayment: PaymentInfo = {
      id: Date.now().toString(),
      type: SALETYPE.CASH,
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      alerts: [],
      notes: ""
    };
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, payments: [...device.payments, newPayment] }
        : device
    ));
  };

  const updateDevicePayment = (deviceId: string, paymentId: string, field: keyof PaymentInfo, value: any) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? {
            ...device, 
            payments: device.payments.map(payment => {
              if (payment.id === paymentId) {
                const updated = { ...payment, [field]: value };
                
                // Auto-fill prix total when switching to cash payment or when amount changes
                if (field === 'type' && value === SALETYPE.CASH) {
                  updated.cashTotalPrice = payment.amount;
                  updated.cashCurrentPayment = 0;
                  updated.cashRemainingAmount = payment.amount;
                } else if (payment.type === SALETYPE.CASH && field === 'amount') {
                  updated.cashTotalPrice = value as number;
                  updated.cashRemainingAmount = Math.max(0, (value as number) - (updated.cashCurrentPayment || 0));
                }
                
                // Auto-calculate for CNAM fields
                if (payment.type === SALETYPE.CNAM) {
                  if (field === 'cnamDebutDate' || field === 'cnamSupportMonths') {
                    const debutDate = field === 'cnamDebutDate' ? value as string : updated.cnamDebutDate;
                    const months = field === 'cnamSupportMonths' ? value as number : updated.cnamSupportMonths;
                    
                    if (debutDate && months) {
                      updated.cnamEndDate = calculateEndDate(debutDate, months);
                    }
                  } else if (field === 'cnamEndDate') {
                    const debutDate = updated.cnamDebutDate;
                    const endDate = value as string;
                    
                    if (debutDate && endDate) {
                      updated.cnamSupportMonths = calculateCnamDuration(debutDate, endDate);
                    }
                  }
                }
                
                // Auto-calculate for Cash payments
                if (payment.type === SALETYPE.CASH) {
                  if (field === 'cashTotalPrice' || field === 'cashCurrentPayment') {
                    const totalPrice = field === 'cashTotalPrice' ? value as number : updated.cashTotalPrice || 0;
                    const currentPayment = field === 'cashCurrentPayment' ? value as number : updated.cashCurrentPayment || 0;
                    
                    updated.cashRemainingAmount = Math.max(0, totalPrice - currentPayment);
                  }
                }
                
                return updated;
              }
              return payment;
            })
          }
        : device
    ));
  };

  // Helper functions for CNAM calculations
  const calculateCnamDuration = (debutDate: string, endDate: string): number => {
    if (!debutDate || !endDate) return 0;
    
    const debut = new Date(debutDate);
    const end = new Date(endDate);
    
    const timeDiff = end.getTime() - debut.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    const monthsApprox = Math.round(daysDiff / 30.44);
    
    return monthsApprox;
  };

  const calculateEndDate = (debutDate: string, months: number): string => {
    if (!debutDate || !months) return '';
    
    const date = new Date(debutDate);
    date.setMonth(date.getMonth() + months);
    date.setDate(date.getDate() - 1);
    
    return date.toISOString().slice(0, 10);
  };

  // Calculate next due date based on frequency
  const calculateNextDueDate = (startDate: string, frequency: string, installmentNumber: number = 1): string => {
    if (!startDate || !frequency) return '';
    
    const date = new Date(startDate);
    
    switch (frequency) {
      case 'WEEKLY':
        date.setDate(date.getDate() + (7 * installmentNumber));
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + installmentNumber);
        break;
      case 'QUARTERLY':
        date.setMonth(date.getMonth() + (3 * installmentNumber));
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + installmentNumber);
        break;
      default:
        return startDate;
    }
    
    return date.toISOString().split('T')[0];
  };

  // Calculate installment amount based on total and number of installments
  const calculateInstallmentAmount = (totalAmount: number, installments: number): number => {
    if (!totalAmount || !installments || installments <= 0) return 0;
    return Math.round((totalAmount / installments) * 100) / 100;
  };

  // Generate schedule preview for any payment type
  const generateSchedulePreview = (payment: PaymentInfo): Array<{date: string, amount: number, description: string}> => {
    const schedule = [];
    
    switch (payment.type) {
      case SALETYPE.CASH:
        if (payment.cashInstallments && payment.cashInstallmentAmount && payment.dueDate) {
          for (let i = 0; i < payment.cashInstallments; i++) {
            const dueDate = calculateNextDueDate(payment.dueDate, payment.cashFrequency || 'MONTHLY', i);
            schedule.push({
              date: dueDate,
              amount: payment.cashInstallmentAmount,
              description: `Versement ${i + 1}/${payment.cashInstallments}`
            });
          }
        }
        break;
        
      case SALETYPE.CHEQUE:
        if (payment.chequeInstallments && payment.amount && payment.dueDate) {
          const installmentAmount = calculateInstallmentAmount(payment.amount, payment.chequeInstallments);
          for (let i = 0; i < payment.chequeInstallments; i++) {
            const dueDate = calculateNextDueDate(payment.dueDate, payment.chequeFrequency || 'MONTHLY', i);
            schedule.push({
              date: dueDate,
              amount: installmentAmount,
              description: `Chèque ${i + 1}/${payment.chequeInstallments}`
            });
          }
        }
        break;
        
      case SALETYPE.VIREMENT:
        if (payment.virementFrequency && payment.amount && payment.dueDate) {
          const installmentAmount = payment.amount;
          for (let i = 0; i < 12; i++) { // Show next 12 occurrences
            const dueDate = calculateNextDueDate(payment.dueDate, payment.virementFrequency, i);
            schedule.push({
              date: dueDate,
              amount: installmentAmount,
              description: `Virement ${i + 1}`
            });
          }
        }
        break;
        
      case SALETYPE.TRAITE:
        if (payment.traiteFrequency && payment.amount && payment.dueDate) {
          const installmentAmount = payment.amount;
          for (let i = 0; i < 12; i++) {
            const dueDate = calculateNextDueDate(payment.dueDate, payment.traiteFrequency, i);
            schedule.push({
              date: dueDate,
              amount: installmentAmount,
              description: `Traite ${i + 1}`
            });
          }
        }
        break;
        
      case SALETYPE.CNAM:
        if (payment.cnamSupportMonths && payment.cnamDebutDate && payment.cnamSupportAmount) {
          const monthlyAmount = calculateInstallmentAmount(payment.cnamSupportAmount, payment.cnamSupportMonths);
          for (let i = 0; i < payment.cnamSupportMonths; i++) {
            const dueDate = calculateNextDueDate(payment.cnamDebutDate, 'MONTHLY', i);
            schedule.push({
              date: dueDate,
              amount: monthlyAmount,
              description: `CNAM ${i + 1}/${payment.cnamSupportMonths}`
            });
          }
        }
        break;
    }
    
    return schedule;
  };

  // Alert management for payments
  const addAlertToPayment = (deviceId: string, paymentId: string) => {
    const newAlert: PaymentAlert = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      note: "",
      createdAt: new Date().toISOString()
    };
    
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? {
            ...device, 
            payments: device.payments.map(payment => 
              payment.id === paymentId 
                ? { ...payment, alerts: [...payment.alerts, newAlert] }
                : payment
            )
          }
        : device
    ));
  };

  const updatePaymentAlert = (deviceId: string, paymentId: string, alertId: string, field: keyof PaymentAlert, value: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? {
            ...device, 
            payments: device.payments.map(payment => 
              payment.id === paymentId 
                ? {
                    ...payment, 
                    alerts: payment.alerts.map(alert => 
                      alert.id === alertId ? { ...alert, [field]: value } : alert
                    )
                  }
                : payment
            )
          }
        : device
    ));
  };

  const removeAlertFromPayment = (deviceId: string, paymentId: string, alertId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? {
            ...device, 
            payments: device.payments.map(payment => 
              payment.id === paymentId 
                ? { ...payment, alerts: payment.alerts.filter(alert => alert.id !== alertId) }
                : payment
            )
          }
        : device
    ));
  };

  const removePaymentFromDevice = (deviceId: string, paymentId: string) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, payments: device.payments.filter(p => p.id !== paymentId) }
        : device
    ));
  };

  const getPaymentTypeLabel = (type: SALETYPE) => {
    switch (type) {
      case SALETYPE.CASH: return 'Espèces';
      case SALETYPE.CHEQUE: return 'Chèque';
      case SALETYPE.TRAITE: return 'Traite';
      case SALETYPE.VIREMENT: return 'Virement';
      case SALETYPE.MONDAT: return 'Mandat postal';
      case SALETYPE.CNAM: return 'CNAM';
      default: return type;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Removed timeline modal state - using simple payments summary instead

  // Calculate totals from all device payments
  const totalRentalPrice = devices.reduce((sum, device) => 
    sum + device.payments.reduce((deviceSum, payment) => deviceSum + payment.amount, 0), 0
  );
  const totalPayments = totalRentalPrice;
  
  // Removed daily rental cost calculation - using payment periods directly

  // Submit rental
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Basic validation
      if (!contractNumber || contractNumber.trim() === "") {
        throw new Error("Le numéro de contrat est obligatoire");
      }
      
      // Validate each device
      for (const device of devices) {
        if (!device.startDate) {
          throw new Error(`La date de début est obligatoire pour l'appareil: ${device.name || 'Sans nom'}`);
        }
        if (device.endDate && new Date(device.startDate) >= new Date(device.endDate)) {
          throw new Error(`La date de fin doit être postérieure à la date de début pour l'appareil: ${device.name || 'Sans nom'}`);
        }
        if (!device.name.trim()) {
          throw new Error("Le nom de l'appareil est obligatoire");
        }
      }
      if (devices.length === 0) {
        throw new Error("Ajoutez au moins un appareil");
      }
      if (totalPayments < totalRentalPrice) {
        throw new Error("Le montant des paiements doit couvrir le prix total de la location");
      }

      // Prepare API data - flatten device-centric structure for API
      const allDevices = devices.filter(d => d.name.trim()).map(device => ({
        name: device.name.trim(),
        model: device.model.trim(),
        serialNumber: device.serialNumber.trim(),
        notes: device.notes.trim() || undefined,
      }));
      
      const allAccessories = devices.flatMap(device => 
        device.accessories.filter(a => a.name.trim()).map(accessory => ({
          name: accessory.name.trim(),
          model: accessory.model.trim(),
          isFree: accessory.isFree,
          notes: accessory.notes.trim() || undefined,
        }))
      );
      
      const allPayments = devices.flatMap(device => 
        device.payments.map(payment => ({
          type: payment.type,
          amount: payment.amount,
          dueDate: payment.dueDate,
          cnamStatus: payment.cnamStatus?.trim() || undefined,
          cnamSupportAmount: payment.cnamSupportAmount || undefined,
          cnamDebutDate: payment.cnamDebutDate || undefined,
          cnamEndDate: payment.cnamEndDate || undefined,
          cnamSupportMonths: payment.cnamSupportMonths || undefined,
          // Cash payment specific fields
          cashTotal: payment.cashTotalPrice || undefined,
          cashAcompte: payment.cashCurrentPayment || undefined,
          cashRest: payment.cashRemainingAmount || undefined,
          cashRestDate: payment.cashRemainingDueDate || undefined,
          notes: payment.notes.trim() || undefined,
          alerts: payment.alerts.map(alert => ({
            date: alert.date,
            note: alert.note.trim() || undefined,
          }))
        }))
      );
      
      // Use first device dates as main rental dates (or calculate earliest/latest)
      const firstDevice = devices[0];
      const earliestStartDate = devices.reduce((earliest, device) => 
        !earliest || device.startDate < earliest ? device.startDate : earliest, ""
      );
      const latestEndDate = devices.reduce((latest, device) => 
        !latest || device.endDate > latest ? device.endDate : latest, ""
      );
      
      const rentalData = {
        patientId: patient.id,
        startDate: earliestStartDate || firstDevice.startDate,
        endDate: latestEndDate || firstDevice.endDate || null,
        contractNumber: contractNumber.trim(),
        notes: notes.trim() || undefined,
        amount: totalRentalPrice,
        type: allPayments[0]?.type || SALETYPE.CASH,
        status: firstDevice.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        actualReturnDate: firstDevice.actualReturnDate || undefined,
        
        devices: allDevices,
        accessories: allAccessories,
        payments: allPayments
      };

      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rentalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création de la location");
      }

      // Success - could redirect or show success message
      alert("Location créée avec succès!");
      onBack(); // Go back to patient selection for now
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient info header */}
      <Card className="p-4 bg-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">{patient.fullName}</h3>
            <p className="text-sm text-gray-600">{patient.phone} • {patient.address}</p>
          </div>
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Changer de patient
          </Button>
        </div>
      </Card>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic rental information (contract and global notes only) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractNumber">Numéro de contrat *</Label>
              <div className="flex gap-2">
                <Input
                  id="contractNumber"
                  value={contractNumber || ""}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="ex: LOC-1234-5678"
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const randomNum1 = Math.floor(Math.random() * 9000) + 1000;
                    const randomNum2 = Math.floor(Math.random() * 9000) + 1000;
                    setContractNumber(`LOC-${randomNum1}-${randomNum2}`);
                  }}
                  className="px-3"
                >
                  Générer
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes générales</Label>
              <Input
                id="notes"
                value={notes || ""}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes générales de la location..."
              />
            </div>
          </div>
        </Card>

        {/* Device-centric sections */}
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
                <div key={device.id} className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
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
                      {/* Removed daily rental price - using payment periods directly */}
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

                  {/* Accessories for this device */}
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

                  {/* Payments for this device */}
                  <div className="mb-6 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <h5 className="font-medium text-yellow-700">Paiements pour cet appareil</h5>
                        <div className="flex space-x-2">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                            {device.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} TND
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPaymentToDevice(device.id)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter paiement
                      </Button>
                    </div>
                    
                    {device.payments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Aucun paiement configuré pour cet appareil
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {device.payments.map((payment, payIndex) => (
                          <div key={payment.id} className="border border-yellow-200 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <h6 className="font-medium flex items-center space-x-2">
                                <span>Paiement {payIndex + 1}</span>
                                <span className="text-sm text-gray-500">
                                  ({getPaymentTypeLabel(payment.type)})
                                </span>
                                {payment.alerts.length > 0 && (
                                  <Badge variant="outline" className="flex items-center space-x-1">
                                    <Bell className="w-3 h-3" />
                                    <span>{payment.alerts.length}</span>
                                  </Badge>
                                )}
                              </h6>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addAlertToPayment(device.id, payment.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Ajouter une alerte"
                                >
                                  <Plus className="w-3 h-3" />
                                  <Bell className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePaymentFromDevice(device.id, payment.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div>
                                <Label className="text-sm">Type de paiement</Label>
                                <Select
                                  value={payment.type}
                                  onValueChange={(value) => updateDevicePayment(device.id, payment.id, 'type', value as SALETYPE)}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={SALETYPE.CASH}>Espèces</SelectItem>
                                    <SelectItem value={SALETYPE.CHEQUE}>Chèque</SelectItem>
                                    <SelectItem value={SALETYPE.TRAITE}>Traite</SelectItem>
                                    <SelectItem value={SALETYPE.VIREMENT}>Virement</SelectItem>
                                    <SelectItem value={SALETYPE.MONDAT}>Mandat postal</SelectItem>
                                    <SelectItem value={SALETYPE.CNAM}>CNAM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Montant (TND) *</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={payment.amount || 0}
                                  onChange={(e) => updateDevicePayment(device.id, payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <DatePicker
                                  label="Date d'échéance"
                                  value={payment.dueDate || ""}
                                  onChange={(value) => updateDevicePayment(device.id, payment.id, 'dueDate', value)}
                                  placeholder="JJ/MM/AAAA"
                                  className="text-sm"
                                  required
                                />
                              </div>
                            </div>

                            {/* Payment Time Zone - For all payment types except CNAM */}
                            {payment.type !== SALETYPE.CNAM && (
                              <div className="bg-orange-50 p-3 rounded border-t">
                                <p className="text-sm font-medium text-orange-700 mb-3">Zone temporelle couverte par ce paiement</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <DatePicker
                                      label="Date début couverture"
                                      value={payment.dueDate || ""}
                                      onChange={(value) => updateDevicePayment(device.id, payment.id, 'dueDate', value)}
                                      placeholder="JJ/MM/AAAA"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    {/* Removed daily coverage calculation */}
                                  </div>
                                </div>
                              </div>
                            )}
                            

                            {/* Legacy: CNAM specific fields (now handled by schedule manager) */}
                            {payment.type === SALETYPE.CNAM && (
                              <div className="border-t pt-3 mt-3 bg-blue-50 p-3 rounded">
                                <p className="text-sm font-medium text-blue-700 mb-3">Informations CNAM</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <Label className="text-sm">Statut CNAM</Label>
                                    <Select
                                      value={payment.cnamStatus || ""}
                                      onValueChange={(value) => updateDevicePayment(device.id, payment.id, 'cnamStatus', value)}
                                    >
                                      <SelectTrigger className="text-sm">
                                        <SelectValue placeholder="Sélectionner statut" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="en_attente">En attente</SelectItem>
                                        <SelectItem value="accord">Accord</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Montant pris en charge CNAM (TND)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={payment.cnamSupportAmount || 0}
                                      onChange={(e) => updateDevicePayment(device.id, payment.id, 'cnamSupportAmount', parseFloat(e.target.value) || 0)}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="border-t border-blue-200 pt-3">
                                  <p className="text-sm font-medium text-blue-600 mb-3">Période de prise en charge CNAM</p>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                      <DatePicker
                                        label="Date de début"
                                        value={payment.cnamDebutDate || ""}
                                        onChange={(value) => updateDevicePayment(device.id, payment.id, 'cnamDebutDate', value)}
                                        placeholder="JJ/MM/AAAA"
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Durée (mois)</Label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={payment.cnamSupportMonths || ""}
                                        onChange={(e) => updateDevicePayment(device.id, payment.id, 'cnamSupportMonths', parseInt(e.target.value) || 0)}
                                        placeholder="ex: 12"
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <DatePicker
                                        label="Date de fin (calculée)"
                                        value={payment.cnamEndDate || ""}
                                        onChange={(value) => updateDevicePayment(device.id, payment.id, 'cnamEndDate', value)}
                                        placeholder="JJ/MM/AAAA"
                                        className="text-sm bg-gray-50"
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      {payment.cnamDebutDate && payment.cnamEndDate && (
                                        <div className="p-2 bg-blue-100 rounded text-center w-full">
                                          <p className="text-lg font-bold text-blue-700">
                                            {calculateCnamDuration(payment.cnamDebutDate, payment.cnamEndDate)}
                                          </p>
                                          <p className="text-xs text-blue-600">mois</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Cash payment specific fields */}
                            {payment.type === SALETYPE.CASH && (
                              <div className="border-t pt-3 mt-3 bg-green-50 p-3 rounded">
                                <p className="text-sm font-medium text-green-700 mb-3">Détails paiement espèces</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <Label className="text-sm">Prix total (TND)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={payment.cashTotalPrice || 0}
                                      onChange={(e) => updateDevicePayment(device.id, payment.id, 'cashTotalPrice', parseFloat(e.target.value) || 0)}
                                      placeholder="Prix total à payer"
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Montant payé maintenant (TND)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={payment.cashCurrentPayment || 0}
                                      onChange={(e) => updateDevicePayment(device.id, payment.id, 'cashCurrentPayment', parseFloat(e.target.value) || 0)}
                                      placeholder="Montant payé actuellement"
                                      className="text-sm"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-sm">Montant restant (TND)</Label>
                                    <Input
                                      type="number"
                                      value={payment.cashRemainingAmount || 0}
                                      readOnly
                                      className="text-sm bg-gray-100"
                                      placeholder="Calculé automatiquement"
                                    />
                                  </div>
                                  <div>
                                    <DatePicker
                                      label="Date d'échéance du reste"
                                      value={payment.cashRemainingDueDate || ""}
                                      onChange={(value) => updateDevicePayment(device.id, payment.id, 'cashRemainingDueDate', value)}
                                      placeholder="JJ/MM/AAAA"
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Alerts section */}
                            {payment.alerts.length > 0 && (
                              <div className="border-t pt-3 mt-3 bg-red-50 p-3 rounded">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium text-red-700 flex items-center">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Alertes ({payment.alerts.length})
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  {payment.alerts.map((alert, alertIndex) => (
                                    <div key={alert.id} className="border border-red-200 rounded p-2 bg-white">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-red-700">
                                          Alerte {alertIndex + 1}
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeAlertFromPayment(device.id, payment.id, alert.id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                          <DatePicker
                                            label="Date de l'alerte"
                                            value={alert.date || ""}
                                            onChange={(value) => updatePaymentAlert(device.id, payment.id, alert.id, 'date', value)}
                                            placeholder="JJ/MM/AAAA"
                                            className="text-xs"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Note</Label>
                                          <Input
                                            value={alert.note || ""}
                                            onChange={(e) => updatePaymentAlert(device.id, payment.id, alert.id, 'note', e.target.value)}
                                            placeholder="Ajoutez une note..."
                                            className="text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3">
                              <Label className="text-sm">Notes</Label>
                              <Input
                                value={payment.notes || ""}
                                onChange={(e) => updateDevicePayment(device.id, payment.id, 'notes', e.target.value)}
                                placeholder="Notes sur ce paiement..."
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Enhanced Global Summary */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-blue-800">Résumé de la location</h3>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{devices.length}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Appareils</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">
                    {devices.reduce((sum, device) => sum + device.accessories.length, 0)}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Accessoires</p>
              <p className="text-xs text-gray-500">
                ({devices.reduce((sum, device) => sum + device.accessories.filter(a => a.isFree).length, 0)} gratuits)
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">
                    {devices.reduce((sum, device) => sum + device.payments.length, 0)}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Paiements</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-indigo-200 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-lg font-bold text-indigo-600">{totalRentalPrice.toFixed(2)}</p>
              <p className="text-sm font-medium text-gray-700">TND Total</p>
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-white rounded-lg p-4 border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contrat</p>
                <p className="font-bold text-gray-800">{contractNumber || 'Non défini'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-bold text-gray-800">{patient.fullName}</p>
              </div>
            </div>
          </div>

          {/* Device breakdown with enhanced info */}
          {devices.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-blue-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Détail par appareil
                </h4>
                <Badge variant="outline" className="text-blue-600">
                  {devices.length} appareil{devices.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              {devices.map((device, index) => {
                const deviceTotal = device.payments.reduce((sum, p) => sum + p.amount, 0);
                const freeAccessories = device.accessories.filter(a => a.isFree).length;
                const paidAccessories = device.accessories.length - freeAccessories;
                
                return (
                  <div key={device.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-800">
                            {device.name || `Appareil ${index + 1}`}
                          </h5>
                          {device.model && (
                            <Badge variant="secondary" className="text-xs">
                              {device.model}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Device dates */}
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                          {device.startDate && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Début: {new Date(device.startDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          {device.endDate && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Fin: {new Date(device.endDate).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        
                        {/* Accessories summary */}
                        {device.accessories.length > 0 && (
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-green-600">
                              {device.accessories.length} acc.
                            </span>
                            {freeAccessories > 0 && (
                              <Badge variant="outline" className="text-green-600 text-xs px-1 py-0">
                                {freeAccessories} gratuit{freeAccessories > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {paidAccessories > 0 && (
                              <Badge variant="outline" className="text-blue-600 text-xs px-1 py-0">
                                {paidAccessories} payant{paidAccessories > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Payment summary */}
                        {device.payments.length > 0 && (
                          <div className="flex items-center space-x-2 text-xs mt-1">
                            <span className="text-yellow-600">
                              {device.payments.length} paiement{device.payments.length > 1 ? 's' : ''}
                            </span>
                            {device.payments.some(p => p.alerts.length > 0) && (
                              <Badge variant="outline" className="text-red-600 text-xs px-1 py-0 flex items-center">
                                <Bell className="w-2 h-2 mr-1" />
                                {device.payments.reduce((sum, p) => sum + p.alerts.length, 0)} alerte{device.payments.reduce((sum, p) => sum + p.alerts.length, 0) > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">
                          {deviceTotal.toFixed(2)} TND
                        </p>
                        {device.payments.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Moy: {(deviceTotal / device.payments.length).toFixed(2)} TND
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={device.status === 'COMPLETED' ? 'default' : device.status === 'PENDING' ? 'secondary' : device.status === 'IN_PROGRESS' ? 'outline' : 'destructive'}
                          className="text-xs"
                        >
                          {device.status === 'PENDING' ? 'En attente' : 
                           device.status === 'IN_PROGRESS' ? 'En cours' : 
                           device.status === 'COMPLETED' ? 'Complété' : 'Annulé'}
                        </Badge>
                      </div>
                      
                      {device.serialNumber && (
                        <span className="text-xs text-gray-500 font-mono">
                          S/N: {device.serialNumber}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Notes section */}
          {notes && (
            <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-gray-700 mb-2">Notes générales</h5>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </Card>

        {/* Timeline Previews */}
        {devices.length > 0 && devices.some(device => device.startDate && device.startDate.trim() !== '') && (
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Timeline des locations</h3>
              <Badge variant="outline" className="text-blue-600">
                {devices.filter(device => device.startDate && device.startDate.trim() !== '').length} appareil{devices.filter(device => device.startDate && device.startDate.trim() !== '').length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* Simple payments summary for each device */}
            <div className="space-y-4">
              {devices.map((device, index) => (
                device.startDate && device.startDate.trim() !== '' && device.payments.length > 0 && (
                  <Card key={device.id} className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      {device.name || `Appareil ${index + 1}`}
                    </h4>
                    <div className="space-y-3">
                      {device.payments.map((payment) => (
                        <div key={payment.id} className="border rounded-lg overflow-hidden">
                          {/* Payment header */}
                          <div className="flex items-center justify-between p-4 bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="text-xs font-medium">
                                {payment.type === SALETYPE.CASH ? 'Espèces' :
                                 payment.type === SALETYPE.CNAM ? 'CNAM' :
                                 payment.type === SALETYPE.TRAITE ? 'Traite' :
                                 payment.type === SALETYPE.CHEQUE ? 'Chèque' :
                                 payment.type === SALETYPE.VIREMENT ? 'Virement' : 'Mandat'}
                              </Badge>
                              <span className="font-semibold text-lg">{payment.amount.toFixed(2)} TND</span>
                            </div>
                            {payment.alerts && payment.alerts.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-600">
                                  {payment.alerts.length} alerte{payment.alerts.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Payment period */}
                          <div className="px-4 py-3 bg-white">
                            <div className="flex items-center space-x-2 text-sm text-gray-700">
                              <Calendar className="w-4 h-4" />
                              <span className="font-medium">Période responsable:</span>
                              {payment.type === SALETYPE.CNAM ? (
                                <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                                  {payment.cnamDebutDate ? formatDate(payment.cnamDebutDate) : 'N/A'} → {payment.cnamEndDate ? formatDate(payment.cnamEndDate) : 'N/A'}
                                </span>
                              ) : (
                                <span className="bg-green-100 px-2 py-1 rounded text-green-800">
                                  À partir du {payment.dueDate ? formatDate(payment.dueDate) : 'Date non définie'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Alerts details */}
                          {payment.alerts && payment.alerts.length > 0 && (
                            <div className="px-4 py-3 bg-red-50 border-t">
                              <div className="space-y-2">
                                {payment.alerts.map((alert) => (
                                  <div key={alert.id} className="flex items-start space-x-2">
                                    <Bell className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-red-700">
                                          {alert.date ? formatDate(alert.date) : 'Date non définie'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-red-600 mt-1">
                                        {alert.note || 'Aucune note pour cette alerte'}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              ))}
            </div>
            
            {/* Global Timeline Summary */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Résumé global de la location</h4>
              
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-lg font-bold text-blue-600">{totalRentalPrice.toFixed(2)} TND</div>
                  <div className="text-sm text-gray-600">Total paiements</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-lg font-bold text-green-600">
                    {devices.length}
                  </div>
                  <div className="text-sm text-gray-600">Appareils loués</div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-lg font-bold text-purple-600">
                    {devices.reduce((sum, device) => sum + device.payments.reduce((pSum, p) => pSum + (p.alerts?.length || 0), 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Alertes totales</div>
                </div>
              </div>

              {/* Timeline Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-lg font-bold text-indigo-600">
                    {devices.reduce((sum, device) => sum + device.payments.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Paiements totaux</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-lg font-bold text-purple-600">
                    {devices.reduce((earliest, device) => 
                      !earliest || device.startDate < earliest ? device.startDate : earliest, ""
                    ) && formatDate(devices.reduce((earliest, device) => 
                      !earliest || device.startDate < earliest ? device.startDate : earliest, ""
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Début location</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-lg font-bold text-orange-600">
                    {(() => {
                      const latestRenewal = devices.reduce((latest, device) => {
                        const deviceRenewal = device.payments.reduce((renewal, payment) => {
                          if (payment.type === SALETYPE.CNAM && payment.cnamEndDate) {
                            return !renewal || payment.cnamEndDate > renewal ? payment.cnamEndDate : renewal;
                          }
                          return renewal;
                        }, "");
                        return !latest || deviceRenewal > latest ? deviceRenewal : latest;
                      }, "");
                      return latestRenewal ? formatDate(latestRenewal) : 'N/A';
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Renouvellement</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-lg font-bold text-cyan-600">{devices.length}</div>
                  <div className="text-sm text-gray-600">Appareils</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Submit button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting || devices.length === 0}
            className="px-8 py-2 text-lg"
            size="lg"
          >
            {isSubmitting ? "Création en cours..." : "Créer la location"}
          </Button>
        </div>
      </form>
      
      {/* Removed timeline modal - using simple payments summary instead */}
    </div>
  );
}