"use client";

import { Patient } from "@/types/patient";
import { formatDate, formatPhoneNumber } from "@/utils/formatters";

interface PatientInfoProps {
  patient: Patient;
}

export default function PatientInfo({ patient }: PatientInfoProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Informations du patient</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 font-medium">Nom complet</p>
          <p className="text-gray-900">{patient.fullName}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Téléphone</p>
          <div className="text-gray-700">{formatPhoneNumber(patient.phone)}</div>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Région</p>
          <p className="text-gray-900">{patient.region}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Adresse</p>
          <p className="text-gray-900">{patient.address || "Non spécifiée"}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Médecin traitant</p>
          <p className="text-gray-900">{patient.doctorName || "Non spécifié"}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Date d&apos;enregistrement</p>
          <div className="text-gray-700">{formatDate(patient.date)}</div>
        </div>
      </div>
    </div>
  );
}
