import React from 'react';

interface PatientFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  diagnosticFilter: string;
  setDiagnosticFilter: (filter: string) => void;
  activityFilter: string;
  setActivityFilter: (filter: string) => void;
  paymentFilter: string;
  setPaymentFilter: (filter: string) => void;
  doctorFilter: string;
  setDoctorFilter: (filter: string) => void;
  doctors: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  diagnosticFilter,
  setDiagnosticFilter,
  activityFilter,
  setActivityFilter,
  paymentFilter,
  setPaymentFilter,
  doctorFilter,
  setDoctorFilter,
  doctors,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="p-6 border-b border-slate-200 bg-slate-50">
      <div className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, région, médecin, adresse..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={diagnosticFilter}
            onChange={(e) => setDiagnosticFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Tous les diagnostics</option>
            <option value="negative">Négatif</option>
            <option value="moderate">Modéré</option>
            <option value="severe">Sévère</option>
            <option value="none">Sans diagnostic</option>
          </select>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Toute activité</option>
            <option value="recent">Activité récente</option>
            <option value="inactive">Inactif</option>
            <option value="hasRentals">Avec locations</option>
            <option value="hasSales">Avec ventes</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Tous les paiements</option>
            <option value="overdue">Paiements en retard</option>
            <option value="current">Paiements à jour</option>
          </select>

          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Tous les médecins</option>
            {doctors.map((doctor) => (
              <option key={doctor} value={doctor}>
                {doctor}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="lastActivity-desc">Dernière activité (Plus récent)</option>
            <option value="lastActivity-asc">Dernière activité (Plus ancien)</option>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="totalSales-desc">Ventes totales (Plus élevé)</option>
            <option value="totalSales-asc">Ventes totales (Plus bas)</option>
            <option value="activeRentals-desc">Locations actives (Plus)</option>
            <option value="activeRentals-asc">Locations actives (Moins)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PatientFilters;