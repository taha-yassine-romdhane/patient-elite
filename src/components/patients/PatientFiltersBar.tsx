import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

type FilterCategory = "all" | "diagnostics" | "sales" | "rentals" | "payments" | "devices" | "accessories";
type SortField = "date" | "amount" | "status" | "type";
type SortDirection = "asc" | "desc";

interface PatientFiltersBarProps {
  filterCategory: FilterCategory;
  setFilterCategory: (category: FilterCategory) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stats: {
    total: number;
    diagnostics: number;
    sales: number;
    rentals: number;
    payments: number;
  };
}

const PatientFiltersBar: React.FC<PatientFiltersBarProps> = ({
  filterCategory,
  setFilterCategory,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  searchTerm,
  setSearchTerm,
  stats
}) => {
  const filters = [
    { id: 'all', label: 'Tout', count: stats.total, color: 'bg-purple-600 text-white' },
    { id: 'diagnostics', label: 'Diagnostics', count: stats.diagnostics, color: 'bg-blue-100 text-blue-700' },
    { id: 'sales', label: 'Ventes', count: stats.sales, color: 'bg-green-100 text-green-700' },
    { id: 'rentals', label: 'Locations', count: stats.rentals, color: 'bg-purple-100 text-purple-700' },
    { id: 'payments', label: 'Paiements', count: stats.payments, color: 'bg-yellow-100 text-yellow-700' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterCategory(filter.id as FilterCategory)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filterCategory === filter.id
                  ? filter.id === 'all' 
                    ? 'bg-purple-600 text-white'
                    : filter.color.replace('100', '600').replace('700', 'white')
                  : filter.color.includes('100') 
                    ? `${filter.color} hover:${filter.color.replace('100', '200')}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Search and Sort Controls */}
        <div className="flex gap-4 items-center">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="date">Trier par date</option>
              <option value="amount">Trier par montant</option>
              <option value="status">Trier par statut</option>
              <option value="type">Trier par type</option>
            </select>
          </div>

          {/* Sort Direction Button */}
          <button
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFiltersBar;