"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PatientSelectionStep from "@/components/admin/rentals/PatientSelectionStep";
import SimpleRentalForm from "@/components/admin/rentals/SimpleRentalForm";
import { Patient } from "@/types/rental";

export default function RentalsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);


  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep(2);
  };

  const handleBackToPatientSelection = () => {
    setSelectedPatient(null);
    setCurrentStep(1);
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nouvelle location
          </h1>
          <p className="text-gray-600 mt-1">Créer un contrat de location simple et efficace</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      
      {/* Simple step indicator */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-2 ${currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
              1
            </span>
            Sélection du patient
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-2 ${currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
              2
            </span>
            Détails de la location
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <PatientSelectionStep 
            onPatientSelect={handlePatientSelect} 
          />
        )}
        
        {currentStep === 2 && selectedPatient && (
          <SimpleRentalForm
            patient={selectedPatient}
            onBack={handleBackToPatientSelection}
          />
        )}
      </div>
    </div>
  );
}