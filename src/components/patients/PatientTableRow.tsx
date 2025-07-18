import React from 'react';
import { Pencil, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { calculateIAHSeverity, formatIAHValue } from '@/utils/diagnosticUtils';
import { ExtendedPatient, Patient } from '@/types/patient';
import { Button } from '../ui/button';

interface PatientTableRowProps {
  patient: ExtendedPatient;
  index: number;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  formatDate: (dateString: string) => string;
}

const PatientTableRow: React.FC<PatientTableRowProps> = ({
  patient,
  index,
  onEdit,
  onDelete,
  formatDate,
}) => {
  const latestDiagnostic = patient.latestDiagnostic;
  const severity = latestDiagnostic ? calculateIAHSeverity(latestDiagnostic.iahResult) : null;

  return (
    <tr 
      className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {patient.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-slate-900">{patient.fullName}</div>
            <div className="text-xs text-slate-500">
              {patient.phone}
              {patient.address && ` • ${patient.address}`}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900">
          {patient.doctorName ? `Dr. ${patient.doctorName}` : '-'}
        </div>
        <div className="text-xs text-slate-500">{patient.region}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {latestDiagnostic ? (
          <div className="flex flex-col space-y-1">
            <div className="text-sm font-medium text-slate-900">
              IAH: {formatIAHValue(latestDiagnostic.iahResult)}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severity!.bgColor} ${severity!.textColor}`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                severity!.color === 'emerald' ? 'bg-emerald-500' : 
                severity!.color === 'amber' ? 'bg-amber-500' : 
                'bg-red-500'
              }`}></div>
              {severity!.labelFr}
            </span>
            <div className="text-xs text-slate-500">
              {formatDate(latestDiagnostic.date)}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic">
            Pas de diagnostic
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm font-medium text-slate-900">
            {patient.totalSales ? `${patient.totalSales.toFixed(2)} TND` : '0.00 TND'}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {patient.sales ? `${patient.sales.length} vente(s)` : '0 vente'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-sm font-medium text-slate-900">
            {patient.activeRentals || 0}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {patient.rentals ? `${patient.rentals.length} total` : '0 total'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900">
          {patient.lastActivity ? formatDate(patient.lastActivity) : 'Jamais'}
        </div>
        <div className="text-xs text-slate-500">
          {patient.lastActivity && (
            <>
              {Math.floor((new Date().getTime() - new Date(patient.lastActivity).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
            </>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900">
          {patient.technician ? `${patient.technician.name}` : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900">
          {patient.supervisor ? `${patient.supervisor.name}` : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          <Button
            onClick={() => onEdit(patient)}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            title="Modifier"
          >
            <Pencil size={16} className="mr-1" />
            Modifier
          </Button>
          <Button
            onClick={() => onDelete(patient)}
            className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} className="mr-1" />
            Supprimer
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default PatientTableRow;