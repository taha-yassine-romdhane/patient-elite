"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import PatientSelectionStep from "@/components/admin/rentals/PatientSelectionStep";
import AppointmentForm from "@/components/admin/appointments/AppointmentForm";
import AppointmentsTable from "@/components/admin/appointments/AppointmentsTable";
import { Patient } from "@/types/rental";

type ViewMode = 'list' | 'create';

export default function AppointmentsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
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

  const handleCreateNew = () => {
    setViewMode('create');
    setCurrentStep(1);
    setSelectedPatient(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentStep(1);
    setSelectedPatient(null);
  };

  const renderHeader = () => {
    if (viewMode === 'create') {
      return (
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nouveau rendez-vous
            </h1>
            <p className="text-gray-600 mt-1">Planifier un rendez-vous avec un patient</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Voir les rendez-vous
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Rendez-vous
          </h1>
          <p className="text-gray-600 mt-1">Gérer les rendez-vous patients</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau rendez-vous
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  };

  const renderStepIndicator = () => {
    if (viewMode !== 'create') return null;

    return (
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
            Détails du rendez-vous
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (viewMode === 'list') {
      return <AppointmentsTable />;
    }

    // Create mode
    return (
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <PatientSelectionStep 
            onPatientSelect={handlePatientSelect} 
          />
        )}
        
        {currentStep === 2 && selectedPatient && (
          <AppointmentForm
            patient={selectedPatient}
            onBack={handleBackToPatientSelection}
          />
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderHeader()}
      {renderStepIndicator()}
      {renderContent()}
    </div>
  );
}