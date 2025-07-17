"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/ui/Stepper";
import PatientSelectionStep from "@/components/admin/rentals/PatientSelectionStep";
import RentalDetailsStep, { RentalFormData } from "@/components/admin/rentals/RentalDetailsStep";
import ConfirmationStep from "@/components/admin/rentals/ConfirmationStep";

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  doctorName?: string;
};

export default function RentalsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setSuccess] = useState(false);

  // Rental form data with updated structure to match RentalDetailsStep
  const [rentalData, setRentalData] = useState<RentalFormData>({
    patientId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default to 30 days
    rentalItems: [], // Changed from 'items' to 'rentalItems'
    totalAmount: 0,
    status: "PENDING",
    returnStatus: "NOT_RETURNED",
    notes: "",
    rentalGroups: [],
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setRentalData({
      ...rentalData,
      patientId: patient.id,
    });
    setCurrentStep(2);
  };

  const handleRentalDataChange = (data: RentalFormData) => {
    setRentalData(data);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Prepare data for API - convert to the new structure
      const apiData = {
        patientId: rentalData.patientId,
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        amount: rentalData.totalAmount,
        status: rentalData.status,
        returnStatus: rentalData.returnStatus,
        notes: rentalData.notes,
        rentalItems: rentalData.rentalItems.map(item => ({
          itemType: item.itemType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          startDate: item.startDate,
          endDate: item.endDate,
          notes: item.notes,
          deviceData: item.deviceData,
          accessoryData: item.accessoryData,
          payments: item.payments.map(payment => ({
            method: payment.method,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            periodStartDate: payment.periodStartDate,
            periodEndDate: payment.periodEndDate,
            chequeNumber: payment.chequeNumber,
            chequeDate: payment.chequeDate,
            traiteDueDate: payment.traiteDueDate,
            cnamStatus: payment.cnamStatus,
            cnamFollowupDate: payment.cnamFollowupDate,
            notes: payment.notes
          }))
        })),
        rentalGroups: rentalData.rentalGroups.map(group => ({
          name: group.name,
          description: group.description,
          totalPrice: group.totalPrice || group.items.reduce((sum, item) => sum + item.totalPrice, 0),
          startDate: group.startDate,
          endDate: group.endDate,
          notes: group.notes,
          items: group.items.map(item => ({
            itemType: item.itemType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            startDate: item.startDate,
            endDate: item.endDate,
            notes: item.notes,
            deviceData: item.deviceData,
            accessoryData: item.accessoryData,
            payments: item.payments.map(payment => ({
              method: payment.method,
              amount: payment.amount,
              paymentDate: payment.paymentDate,
              periodStartDate: payment.periodStartDate,
              periodEndDate: payment.periodEndDate,
              chequeNumber: payment.chequeNumber,
              chequeDate: payment.chequeDate,
              traiteDueDate: payment.traiteDueDate,
              cnamStatus: payment.cnamStatus,
              cnamFollowupDate: payment.cnamFollowupDate,
              notes: payment.notes
            }))
          })),
          sharedPayments: group.sharedPayments.map(payment => ({
            method: payment.method,
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            periodStartDate: payment.periodStartDate,
            periodEndDate: payment.periodEndDate,
            chequeNumber: payment.chequeNumber,
            chequeDate: payment.chequeDate,
            traiteDueDate: payment.traiteDueDate,
            cnamStatus: payment.cnamStatus,
            cnamFollowupDate: payment.cnamFollowupDate,
            notes: payment.notes
          }))
        }))
      };
      
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'enregistrement de la location");
      }
      
      const result = await response.json();
      
      console.log("Rental created successfully:", result);
      
      setSuccess(true);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la location");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewRental = () => {
    // Reset form and go back to step 1
    setSelectedPatient(null);
    setRentalData({
      patientId: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      rentalItems: [], // Changed from 'items' to 'rentalItems'
      totalAmount: 0,
      status: "PENDING",
      returnStatus: "NOT_RETURNED",
      notes: "",
      rentalGroups: [],
    });
    setCurrentStep(1);
    setSuccess(false);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-800">Enregistrer une location</h1>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au tableau de bord
        </button>
      </div>
      
      <div className="mb-8">
        <Stepper
          steps={[
            "Sélection du patient",
            "Détails de la location",
            "Confirmation",
          ]}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow going back to previous steps
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
      </div>
      
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <PatientSelectionStep 
            onPatientSelect={handlePatientSelect} 
          />
        )}
        
        {currentStep === 2 && selectedPatient && (
          <RentalDetailsStep 
            patient={selectedPatient}
            rentalData={rentalData}
            onRentalDataChange={handleRentalDataChange}
            onPrevious={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
        
        {currentStep === 3 && (
          <ConfirmationStep 
            onNewRental={handleNewRental} 
          />
        )}
      </div>
    </div>
  );
}
