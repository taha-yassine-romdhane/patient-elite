"use client";

import { useState } from "react";
import { Technician } from "@prisma/client";
import Modal from "@/components/ui/Modal";
import PatientForm, { PatientFormData } from "@/components/PatientForm";
import { fetchWithAuth } from "@/lib/apiClient";

interface PatientCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: PatientFormData) => void;
  technicians?: Technician[];
  currentTechnicianId?: string;
}

export default function PatientCreationModal({
  isOpen,
  onClose,
  onPatientCreated,
  technicians = [],
  currentTechnicianId = "",
}: PatientCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddPatient = async (patientData: PatientFormData) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Add the date field required by the Prisma schema
      const patientDataWithDate = {
        ...patientData,
        date: new Date() // Required by the Prisma schema
      };
      
      const response = await fetchWithAuth("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientDataWithDate),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout du patient");
      }
      
      const newPatient = await response.json();
      
      // Close modal and notify parent
      onClose();
      onPatientCreated(newPatient);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title=""
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <PatientForm 
        technicians={technicians}
        currentTechnicianId={currentTechnicianId}
        onSubmit={handleAddPatient}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
}
