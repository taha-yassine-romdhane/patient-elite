import React from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Patient } from '@/types/patient';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patient: Patient | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patient,
}) => {
  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression">
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-slate-900">Supprimer le patient</h3>
          <p className="mt-2 text-sm text-slate-500">
            Êtes-vous sûr de vouloir supprimer <span className="font-bold">{patient.fullName}</span> ?
            <br />
            Cette action est irréversible et supprimera toutes les données associées (ventes, locations, diagnostics, etc.).
          </p>
        </div>
      </div>
      <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onConfirm}
        >
          Supprimer
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Annuler
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;