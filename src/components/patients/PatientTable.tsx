import React from 'react';
import PatientTableRow from './PatientTableRow';
import { ExtendedPatient, Patient } from '@/types/patient';

interface PatientTableProps {
  patients: ExtendedPatient[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  formatDate: (dateString: string) => string;
}

const PatientTable: React.FC<PatientTableProps> = ({
  patients,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  formatDate,
}) => {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return (
      <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center">
                Patient
                <SortIcon field="name" />
              </div>
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Médecin & Région
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Dernier diagnostic
            </th>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("totalSales")}
            >
              <div className="flex items-center">
                Ventes totales
                <SortIcon field="totalSales" />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("activeRentals")}
            >
              <div className="flex items-center">
                Locations actives
                <SortIcon field="activeRentals" />
              </div>
            </th>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("lastActivity")}
            >
              <div className="flex items-center">
                Dernière activité
                <SortIcon field="lastActivity" />
              </div>
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Technicien
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Superviseur
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {patients.map((patient, index) => (
            <PatientTableRow
              key={patient.id}
              patient={patient}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              formatDate={formatDate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;