"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/ui/Stepper";
import PatientSelectionStep from "@/components/admin/sales/PatientSelectionStep";
import SaleDetailsStep from "@/components/admin/sales/SaleDetailsStep";
import ConfirmationStep from "@/components/admin/sales/ConfirmationStep";
import { SALETYPE } from "@prisma/client";
import { createTasksFromSale, saveTasksToLocalStorage } from "@/utils/taskUtils";

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  doctorName?: string;
};

type DeviceItem = {
  type: "DEVICE";
  name: string;
  model: string;
  serialNumber: string;
  quantity: number;
};

type AccessoryItem = {
  type: "ACCESSORY";
  name: string;
  model: string;
  quantity: number;
};

type SaleItem = DeviceItem | AccessoryItem;

type PaymentEntry = {
  method: SALETYPE;
  amount: number;
  // Additional fields for specific payment types
  cashTotal?: number;
  cashAcompte?: number;
  cashRest?: number;
  cashRestDate?: string; // NEW: Date for cash rest payment
  cnamStatus?: "ATTENTE" | "ACCORD";
  cnamFollowupDate?: string; // NEW: Date for CNAM follow-up
  traiteDate?: string;
};

type SaleFormData = {
  patientId: string;
  date: string;
  items: SaleItem[];
  payments: PaymentEntry[];
  totalAmount: number;
  transactionStatus: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
};

export default function SalesPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setSuccess] = useState(false);
  
  // Sale form data with improved structure
  const [saleData, setSaleData] = useState<SaleFormData>({
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    items: [],
    payments: [],
    totalAmount: 0,
    transactionStatus: "PENDING",
    notes: "",
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSaleData({
      ...saleData,
      patientId: patient.id,
    });
    setCurrentStep(2);
  };

  const handleSaleDataChange = (data: SaleFormData) => {
    setSaleData(data);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Prepare data for API
      const apiData = {
        patientId: saleData.patientId,
        date: saleData.date,
        amount: saleData.totalAmount,
        status: saleData.transactionStatus,
        // For now, use the first payment method for backward compatibility
        // TODO: Update API to handle multiple payments
        type: saleData.payments.length > 0 ? saleData.payments[0].method : "CASH",
        notes: saleData.notes,
        devices: saleData.items
          .filter((item): item is DeviceItem => item.type === "DEVICE")
          .map(item => ({
            name: item.name,
            model: item.model,
            serialNumber: item.serialNumber,
            quantity: item.quantity
          })),
        accessories: saleData.items
          .filter((item): item is AccessoryItem => item.type === "ACCESSORY")
          .map(item => ({
            name: item.name,
            model: item.model,
            quantity: item.quantity
          })),
        // Include payment details for future use
        payments: saleData.payments
      };
      
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'enregistrement de la vente");
      }
      
      const result = await response.json();
      
      // Create calendar tasks from the sale data
      if (result.success && result.data) {
        const tasksToCreate = createTasksFromSale({
          ...result.data,
          payments: saleData.payments, // Use the original payment data with all fields
          patient: selectedPatient
        });
        
        if (tasksToCreate.length > 0) {
          saveTasksToLocalStorage(tasksToCreate);
          console.log(`Created ${tasksToCreate.length} calendar tasks for this sale`);
        }
      }
      
      setSuccess(true);
      setCurrentStep(3);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Une erreur s'est produite lors de l'enregistrement de la vente");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSale = () => {
    // Reset form and go back to step 1
    setSelectedPatient(null);
    setSaleData({
      patientId: "",
      date: new Date().toISOString().split("T")[0],
      items: [],
      payments: [],
      totalAmount: 0,
      transactionStatus: "PENDING",
      notes: "",
    });
    setCurrentStep(1);
    setSuccess(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Enregistrer une vente</h1>
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
            "Détails de la vente",
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
          <SaleDetailsStep 
            patient={selectedPatient}
            saleData={saleData}
            onSaleDataChange={handleSaleDataChange}
            onPrevious={() => setCurrentStep(1)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
        
        {currentStep === 3 && (
          <ConfirmationStep 
            onNewSale={handleNewSale} 
          />
        )}
      </div>
    </div>
  );
}
