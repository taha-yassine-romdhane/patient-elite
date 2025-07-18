import React from 'react';
import { User, Phone, CreditCard, MapPin, Home, Stethoscope, UserCog } from 'lucide-react';

interface PatientInfoCardProps {
  patient: {
    fullName: string;
    phone: string;
    cin?: string;
    hasCnam: boolean;
    cnamId?: string;
    region: string;
    address: string;
    addressDetails?: string;
    doctorName: string;
    technician?: {
      name: string;
      role: string;
    };
    supervisor?: {
      name: string;
      role: string;
    };
    createdAt: string;
  };
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <User className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Nom complet</p>
            <p className="font-semibold text-gray-900">{patient.fullName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Phone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Téléphone</p>
            <p className="font-semibold text-gray-900">{patient.phone}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">CIN</p>
            <p className="font-semibold text-gray-900">{patient.cin || 'Non renseigné'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">CNAM</p>
            <p className="font-semibold text-gray-900">
              {patient.hasCnam ? `Oui (${patient.cnamId})` : 'Non'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MapPin className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Région</p>
            <p className="font-semibold text-gray-900">{patient.region}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Home className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Adresse</p>
            <p className="font-semibold text-gray-900">{patient.address}</p>
            {patient.addressDetails && (
              <p className="text-xs text-gray-500 mt-1">{patient.addressDetails}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Stethoscope className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Médecin</p>
            <p className="font-semibold text-gray-900">Dr. {patient.doctorName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <UserCog className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Technicien</p>
            <p className="font-semibold text-gray-900">
              {patient.technician?.name || 'Non assigné'}
            </p>
            {patient.technician?.role && (
              <p className="text-xs text-gray-500">{patient.technician.role}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <UserCog className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Superviseur</p>
            <p className="font-semibold text-gray-900">
              {patient.supervisor?.name || 'Non assigné'}
            </p>
            {patient.supervisor?.role && (
              <p className="text-xs text-gray-500">{patient.supervisor.role}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;