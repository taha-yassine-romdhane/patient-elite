"use client";

import Modal from "@/components/ui/Modal";
import PatientForm, { PatientFormData } from "@/components/PatientForm";
import { Technician } from "@prisma/client";

interface PatientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: PatientFormData) => void;
  isLoading: boolean;
  technicians: Technician[];
  currentTechnicianId: string;
  initialData?: PatientFormData;
}

export default function PatientFormDialog({
  isOpen,
  onClose,
  title,
  onSubmit,
  isLoading,
  technicians,
  currentTechnicianId,
  initialData
}: PatientFormDialogProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      size="xl"
      className="max-h-[95vh]"
    >
      <PatientForm
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        technicians={technicians}
        currentTechnicianId={currentTechnicianId}
        initialData={initialData}
        context="admin"
      />
    </Modal>
  );
}