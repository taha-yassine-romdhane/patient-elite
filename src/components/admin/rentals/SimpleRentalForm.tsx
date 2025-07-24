"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Patient } from "@/types/rental";
import { SALETYPE } from "@prisma/client";

// Import new components
import BasicRentalInfo from "./simple/BasicRentalInfo";
import DevicesSection, { RentalDevice } from "./simple/DevicesSection";
import AccessoriesSection, { RentalAccessory } from "./simple/AccessoriesSection";
import PaymentsSection, { PaymentInfo } from "./simple/PaymentsSection";
import RentalSummary from "./simple/RentalSummary";

interface SimpleRentalFormProps {
  patient: Patient;
  onBack: () => void;
}

export default function SimpleRentalForm({ patient, onBack }: SimpleRentalFormProps) {
  // Basic rental info
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [returnStatus, setReturnStatus] = useState("NOT_RETURNED");
  const [actualReturnDate, setActualReturnDate] = useState("");

  // Equipment
  const [devices, setDevices] = useState<RentalDevice[]>([]);
  const [accessories, setAccessories] = useState<RentalAccessory[]>([]);

  // Payments
  const [payments, setPayments] = useState<PaymentInfo[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calculate totals from payments only
  const totalRentalPrice = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

  // Submit rental
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Basic validation
      if (!startDate) {
        throw new Error("La date de début est obligatoire");
      }
      if (!contractNumber || contractNumber.trim() === "") {
        throw new Error("Le numéro de contrat est obligatoire");
      }
      if (endDate && new Date(startDate) >= new Date(endDate)) {
        throw new Error("La date de fin doit être postérieure à la date de début");
      }
      if (devices.length === 0 && accessories.length === 0) {
        throw new Error("Ajoutez au moins un appareil ou accessoire");
      }
      if (totalPayments < totalRentalPrice) {
        throw new Error("Le montant des paiements doit couvrir le prix total de la location");
      }

      // Prepare API data
      const rentalData = {
        patientId: patient.id,
        startDate,
        endDate: endDate || null,
        contractNumber: contractNumber.trim(),
        notes: notes.trim() || undefined,
        amount: totalRentalPrice,
        type: payments[0]?.type || SALETYPE.CASH,
        status: status as 'PENDING' | 'COMPLETED' | 'CANCELLED',
        returnStatus: returnStatus as 'NOT_RETURNED' | 'RETURNED' | 'PARTIALLY_RETURNED' | 'DAMAGED',
        actualReturnDate: actualReturnDate || undefined,
        
        // Devices and accessories
        devices: devices.filter(d => d.name.trim()).map(device => ({
          name: device.name.trim(),
          model: device.model.trim(),
          serialNumber: device.serialNumber.trim(),
          notes: device.notes.trim() || undefined,
        })),
        
        accessories: accessories.filter(a => a.name.trim()).map(accessory => ({
          name: accessory.name.trim(),
          model: accessory.model.trim(),
          isFree: accessory.isFree,
          notes: accessory.notes.trim() || undefined,
        })),

        // Payments
        payments: payments.map(payment => ({
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
        {/* Basic rental information */}
        <BasicRentalInfo
          startDate={startDate}
          endDate={endDate}
          contractNumber={contractNumber}
          notes={notes}
          status={status}
          returnStatus={returnStatus}
          actualReturnDate={actualReturnDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onContractNumberChange={setContractNumber}
          onNotesChange={setNotes}
          onStatusChange={setStatus}
          onReturnStatusChange={setReturnStatus}
          onActualReturnDateChange={setActualReturnDate}
        />

        {/* Devices section */}
        <DevicesSection
          devices={devices}
          onDevicesChange={setDevices}
        />

        {/* Accessories section */}
        <AccessoriesSection
          accessories={accessories}
          onAccessoriesChange={setAccessories}
        />

        {/* Payments section */}
        <PaymentsSection
          payments={payments}
          totalRentalPrice={totalRentalPrice}
          onPaymentsChange={setPayments}
        />

        {/* Summary */}
        <RentalSummary
          devices={devices}
          accessories={accessories}
          payments={payments}
          status={status}
          returnStatus={returnStatus}
        />

        {/* Submit button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting || totalPayments < totalRentalPrice || (devices.length === 0 && accessories.length === 0)}
            className="px-8 py-2 text-lg"
            size="lg"
          >
            {isSubmitting ? "Création en cours..." : "Créer la location"}
          </Button>
        </div>
      </form>
    </div>
  );
}