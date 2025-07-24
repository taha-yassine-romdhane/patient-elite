"use client";

import { useState } from "react";
import { Technician, Affiliation, Beneficiary } from "@prisma/client";
import { Patient } from "@/types/patient";
import Modal from "@/components/ui/Modal";
import PatientForm, { PatientFormData } from "@/components/PatientForm";
import { parseAddress, formatAddress } from "@/utils/addressParser";

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientUpdated: (patient: Patient) => void;
  patient: Patient;
  technicians?: Technician[];
  currentTechnicianId?: string;
}

export default function PatientEditModal({
  isOpen,
  onClose,
  onPatientUpdated,
  patient,
  technicians = [],
  currentTechnicianId = ""
}: PatientEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Use addressDetails from database if available, otherwise parse from address
  const addressDetails = patient.addressDetails || "";
  const { delegation } = parseAddress(patient.address || "", patient.region);
  
  // Transform patient data from Prisma model to form data shape
  const initialDataForForm: PatientFormData = {
    fullName: patient.fullName,
    phone: patient.phone,
    cin: patient.cin ?? undefined,
    date: patient.date ? new Date(patient.date).toISOString().split('T')[0] : undefined,
    hasCnam: patient.hasCnam ?? false,
    cnamId: patient.cnamId ?? undefined,
    affiliation: (patient.affiliation as Affiliation) ?? Affiliation.CNSS,
    beneficiary: (patient.beneficiary as Beneficiary) ?? Beneficiary.SOCIAL_INSURED,
    region: patient.region,
    address: delegation,
    addressDetails: addressDetails,
    doctorName: patient.doctorName ?? undefined,
    technicianId: patient.technicianId ?? undefined,
    supervisorId: patient.supervisorId ?? undefined,
  };

  const handleUpdatePatient = async (patientData: PatientFormData) => {
    setIsLoading(true);
    setError("");
    
    try {
      // Format the address by combining delegation and address details
      const formattedAddress = formatAddress(patientData.address, patientData.addressDetails);
      
      // Send both the formatted address and separate addressDetails
      const dataToSend = {
        ...patientData,
        address: formattedAddress,
        addressDetails: patientData.addressDetails || ""
      };
      
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la modification du patient");
      }
      
      const updatedPatient = await response.json();
      
      // Close modal and notify parent
      onClose();
      onPatientUpdated(updatedPatient);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Modifier le patient"
      size="lg"
      className="max-h-[90vh]"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <PatientForm 
        technicians={technicians}
        currentTechnicianId={currentTechnicianId}
        initialData={initialDataForForm}
        onSubmit={handleUpdatePatient}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
}
