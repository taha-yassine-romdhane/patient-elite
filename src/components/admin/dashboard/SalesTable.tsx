"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { calculateIAHSeverity, formatIAHValue } from "@/utils/diagnosticUtils";

// Format date function
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

type Device = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  price: number;
};

type Accessory = {
  id: string;
  name: string;
  model: string;
  quantity: number;
  price: number;
};

type Payment = {
  id: string;
  amount: number;
  type: "CASH" | "CHEQUE" | "TRAITE" | "CNAM" | "VIREMENT" | "MONDAT";
  paymentDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
};

type Diagnostic = {
  id: number;
  date: string;
  polygraph: string;
  iahResult: number;
  idResult: number;
  remarks?: string;
};

type Sale = {
  id: string;
  date: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  patient: {
    id: string;
    fullName: string;
    phone?: string;
    region?: string;
    address?: string;
    doctorName?: string;
    diagnostics?: Diagnostic[];
    latestDiagnostic?: Diagnostic;
  };
  devices: Device[];
  accessories: Accessory[];
  payments: Payment[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
};

export default function SalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/sales");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des ventes");
        }
        const data = await response.json();
        setSales(data);
        setFilteredSales(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Filter and search sales
  useEffect(() => {
    let filtered = sales;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(sale =>
        sale.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.patient.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.patient.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.patient.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    // Apply payment type filter
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter(sale => 
        sale.payments.some(payment => payment.type === paymentTypeFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "patient":
          aValue = a.patient.fullName;
          bValue = b.patient.fullName;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "date":
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSales(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [sales, searchTerm, statusFilter, paymentTypeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSeverityStats = () => {
    const stats = { negative: 0, moderate: 0, severe: 0, noData: 0 };
    
    filteredSales.forEach(sale => {
      if (sale.patient.latestDiagnostic) {
        const severity = calculateIAHSeverity(sale.patient.latestDiagnostic.iahResult);
        stats[severity.level]++;
      } else {
        stats.noData++;
      }
    });
    
    return stats;
  };

  const getItemsWithPayments = (sale: Sale): Array<{ name: string; paymentType: string; amount?: number }> => {
    const items: Array<{ name: string; paymentType: string; amount?: number }> = [];
    
    // Get main payment type (use first payment or most significant)
    const mainPayment = sale.payments && sale.payments.length > 0 ? 
      sale.payments.reduce((prev, current) => 
        (current.amount || 0) > (prev.amount || 0) ? current : prev
      ) : null;
    
    // Add devices with main payment
    if (Array.isArray(sale.devices)) {
      sale.devices.forEach(device => {
        if (device?.name) {
          items.push({
            name: device.name,
            paymentType: mainPayment?.type || 'PENDING',
            amount: mainPayment?.amount
          });
        }
      });
    }
    
    // Add accessories with main payment
    if (Array.isArray(sale.accessories)) {
      sale.accessories.forEach(accessory => {
        if (accessory?.name) {
          const quantity = accessory.quantity && accessory.quantity > 1 ? ` (x${accessory.quantity})` : '';
          items.push({
            name: `${accessory.name}${quantity}`,
            paymentType: mainPayment?.type || 'PENDING',
            amount: mainPayment?.amount
          });
        }
      });
    }
    
    return items;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-slate-600 font-medium">Chargement des ventes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Ventes récentes</h3>
        </div>
        <div className="p-8 text-center">
          <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-slate-800 mb-2">Aucune vente trouvée</h4>
          <p className="text-slate-600 mb-6">Commencez par créer votre première vente</p>
          <Link 
            href="/employee/sales" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer une vente
          </Link>
        </div>
      </div>
    );
  }

  const severityStats = getSeverityStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Ventes récentes</h3>
          <div className="flex items-center space-x-4">
            <div className="text-green-100 text-sm">
              {filteredSales.length} vente(s) trouvée(s)
            </div>
            <Link
              href="/employee/sales"
              className="text-green-100 hover:text-white transition-colors text-sm font-medium"
            >
              Voir toutes
            </Link>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par patient, téléphone, région, adresse, docteur, ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Complété</option>
              <option value="CANCELLED">Annulé</option>
            </select>

            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="all">Tous les types de paiement</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Chèque</option>
              <option value="TRAITE">Traite</option>
              <option value="CNAM">CNAM</option>
              <option value="VIREMENT">Virement</option>
              <option value="MONDAT">Mondat</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="date-desc">Date (Plus récent)</option>
              <option value="date-asc">Date (Plus ancien)</option>
              <option value="patient-asc">Patient (A-Z)</option>
              <option value="patient-desc">Patient (Z-A)</option>
              <option value="amount-desc">Montant (Plus élevé)</option>
              <option value="amount-asc">Montant (Plus bas)</option>
            </select>
          </div>
        </div>

        {/* Severity Statistics */}
        {severityStats.negative + severityStats.moderate + severityStats.severe > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-slate-600">Négatif: {severityStats.negative}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-slate-600">Modéré: {severityStats.moderate}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-slate-600">Sévère: {severityStats.severe}</span>
            </div>
            {severityStats.noData > 0 && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-400 rounded-full mr-2"></div>
                <span className="text-slate-600">Sans diagnostic: {severityStats.noData}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("patient")}
              >
                <div className="flex items-center">
                  Patient
                  {sortBy === "patient" && (
                    <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortBy === "date" && (
                    <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Docteur
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Adresse
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Diagnostic
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Créé par
              </th>
              <th 
                scope="col" 
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center">
                  Montant
                  {sortBy === "amount" && (
                    <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Paiements
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Articles
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {currentSales.map((sale, index) => {
              const latestDiagnostic = sale.patient.latestDiagnostic;
              const severity = latestDiagnostic ? calculateIAHSeverity(latestDiagnostic.iahResult) : null;
              
              return (
                <tr 
                  key={sale.id} 
                  className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                  onClick={() => window.location.href = `/employee/patients/${sale.patient.id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                          {sale.patient.fullName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900">{sale.patient.fullName}</div>
                        <div className="text-xs text-slate-500">
                          {sale.patient.phone && `${sale.patient.phone}`}
                          {sale.patient.region && ` • ${sale.patient.region}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{formatDate(sale.date)}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {sale.patient.doctorName ? `Dr. ${sale.patient.doctorName}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {sale.patient.address || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {latestDiagnostic ? (
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-bold text-slate-900">
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
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        Pas de diagnostic
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {sale.createdBy ? ` ${sale.createdBy.name}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{sale.amount.toFixed(2)} TND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        sale.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {sale.status === 'COMPLETED' ? 'Complété' : 
                       sale.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {sale.payments.map((payment) => {
                        const paymentColors = {
                          CASH: 'bg-green-100 text-green-800',
                          CHEQUE: 'bg-blue-100 text-blue-800',
                          TRAITE: 'bg-purple-100 text-purple-800',
                          CNAM: 'bg-orange-100 text-orange-800',
                          VIREMENT: 'bg-indigo-100 text-indigo-800',
                          MONDAT: 'bg-gray-100 text-gray-800'
                        };
                        const colorClass = paymentColors[payment.type] || 'bg-gray-100 text-gray-800';
                        
                        return (
                          <span key={payment.id} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                            {payment.type}: {payment.amount.toFixed(2)} TND
                            {payment.chequeNumber && ` (${payment.chequeNumber})`}
                            {payment.chequeDate && ` - ${formatDate(payment.chequeDate)}`}
                            {payment.traiteDueDate && ` - Échéance: ${formatDate(payment.traiteDueDate)}`}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {getItemsWithPayments(sale).map((item, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.paymentType === 'CASH' ? 'bg-green-100 text-green-800' :
                            item.paymentType === 'CHEQUE' ? 'bg-blue-100 text-blue-800' :
                            item.paymentType === 'TRAITE' ? 'bg-purple-100 text-purple-800' :
                            item.paymentType === 'CNAM' ? 'bg-orange-100 text-orange-800' :
                            item.paymentType === 'VIREMENT' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.name}
                          {item.amount !== undefined && (
                            <span className="ml-1 text-xs text-slate-500">
                              ({item.amount.toFixed(2)} TND)
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-600">
              <span>
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredSales.length)} sur {filteredSales.length} ventes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
