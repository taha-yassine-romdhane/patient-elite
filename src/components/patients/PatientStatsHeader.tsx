import React from 'react';
import { ActivityStats } from '@/types/patient';

interface PatientStatsHeaderProps {
  filteredPatientsCount: number;
  activityStats: ActivityStats;
}

const PatientStatsHeader: React.FC<PatientStatsHeaderProps> = ({
  filteredPatientsCount,
  activityStats,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Patients ({filteredPatientsCount})</h3>
        <div className="flex items-center space-x-4 text-blue-100 text-sm">
          <div>Diagnostics: {activityStats.withDiagnostics}</div>
          <div>Ventes: {activityStats.withSales}</div>
          <div>Locations actives: {activityStats.withActiveRentals}</div>
          <div>Paiements en retard: {activityStats.withOverduePayments}</div>
        </div>
      </div>
    </div>
  );
};

export default PatientStatsHeader;