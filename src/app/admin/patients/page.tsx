"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Pencil, FileText, Activity, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Technician, Patient } from "@prisma/client";
import PatientForm, { PatientFormData } from "@/components/PatientForm";
import Modal from "@/components/ui/Modal";
import PatientEditModal from "@/components/patients/PatientEditModal";
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

// Extended patient type with aggregated data
type ExtendedPatient = Patient & {
  diagnostics?: {
    id: number;
    date: string;
    polygraph: string;
    iahResult: number;
    idResult: number;
    remarks?: string;
  }[];
  sales?: {
    id: string;
    date: string;
    amount: number;
    status: string;
    devices: { name: string }[];
    accessories: { name: string }[];
    payments: { type: string; amount: number }[];
  }[];
  rentals?: {
    id: string;
    startDate: string;
    endDate: string;
    amount: number;
    status: string;
    returnStatus: string;
    devices: { name: string }[];
    payments: { type: string; amount: number; periodEndDate?: string }[];
  }[];
  latestDiagnostic?: {
    id: number;
    date: string;
    polygraph: string;
    iahResult: number;
    idResult: number;
  };
  totalSales?: number;
  activeRentals?: number;
  overduePayments?: number;
  lastActivity?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<ExtendedPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<ExtendedPatient[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosticFilter, setDiagnosticFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastActivity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Get current user's ID if they are a technician
  const currentUserId = "";

  useEffect(() => {
    fetchPatientsWithAggregatedData();
    fetchTechnicians();
  }, []);

  const filterAndSortPatients = useCallback(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(patient =>
        patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply diagnostic filter
    if (diagnosticFilter !== "all") {
      filtered = filtered.filter(patient => {
        if (!patient.latestDiagnostic) return diagnosticFilter === "none";
        const severity = calculateIAHSeverity(patient.latestDiagnostic.iahResult);
        return severity.level === diagnosticFilter;
      });
    }

    // Apply activity filter
    if (activityFilter !== "all") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      filtered = filtered.filter(patient => {
        const lastActivity = patient.lastActivity ? new Date(patient.lastActivity) : null;
        
        switch (activityFilter) {
          case "recent":
            return lastActivity && lastActivity > thirtyDaysAgo;
          case "inactive":
            return !lastActivity || lastActivity <= thirtyDaysAgo;
          case "hasRentals":
            return patient.activeRentals && patient.activeRentals > 0;
          case "hasSales":
            return patient.sales && patient.sales.length > 0;
          default:
            return true;
        }
      });
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(patient => {
        switch (paymentFilter) {
          case "overdue":
            return patient.overduePayments && patient.overduePayments > 0;
          case "current":
            return patient.activeRentals && patient.activeRentals > 0 && (!patient.overduePayments || patient.overduePayments === 0);
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "name":
          aValue = a.fullName;
          bValue = b.fullName;
          break;
        case "totalSales":
          aValue = a.totalSales || 0;
          bValue = b.totalSales || 0;
          break;
        case "activeRentals":
          aValue = a.activeRentals || 0;
          bValue = b.activeRentals || 0;
          break;
        case "lastActivity":
        default:
          aValue = a.lastActivity ? new Date(a.lastActivity) : new Date(0);
          bValue = b.lastActivity ? new Date(b.lastActivity) : new Date(0);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, diagnosticFilter, activityFilter, paymentFilter, sortBy, sortOrder, patients]);

  useEffect(() => {
    filterAndSortPatients();
  }, [filterAndSortPatients]);

  const fetchPatientsWithAggregatedData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients with all related data
      const [patientsRes, diagnosticsRes, salesRes, rentalsRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/diagnostics"),
        fetch("/api/sales"),
        fetch("/api/rentals")
      ]);

      if (!patientsRes.ok || !diagnosticsRes.ok || !salesRes.ok || !rentalsRes.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const [patientsData, diagnosticsData, salesData, rentalsData] = await Promise.all([
        patientsRes.json(),
        diagnosticsRes.json(),
        salesRes.json(),
        rentalsRes.json()
      ]);

      // Define types for API responses
      interface DiagnosticData {
        id: number;
        date: string;
        polygraph: string;
        iahResult: number;
        idResult: number;
        remarks?: string;
        patient: { id: string };
      }

      interface SaleData {
        id: string;
        date: string;
        amount: number;
        status: string;
        devices: { name: string }[];
        accessories: { name: string }[];
        payments: { type: string; amount: number }[];
        patient: { id: string };
      }

      interface RentalData {
        id: string;
        startDate: string;
        endDate: string;
        amount: number;
        status: string;
        returnStatus: string;
        devices: { name: string }[];
        payments: { type: string; amount: number; periodEndDate?: string }[];
        patient: { id: string };
      }

      // Aggregate data for each patient
      const extendedPatients: ExtendedPatient[] = patientsData.map((patient: Patient) => {
        const patientDiagnostics = diagnosticsData.filter((d: DiagnosticData) => d.patient.id === patient.id);
        const patientSales = salesData.filter((s: SaleData) => s.patient.id === patient.id);
        const patientRentals = rentalsData.filter((r: RentalData) => r.patient.id === patient.id);

        // Calculate aggregated statistics
        const totalSales = patientSales.reduce((sum: number, sale: SaleData) => sum + sale.amount, 0);
        const activeRentals = patientRentals.filter((r: RentalData) => r.returnStatus === "NOT_RETURNED").length;
        
        // Calculate overdue payments
        const today = new Date();
        const overduePayments = patientRentals.reduce((count: number, rental: RentalData) => {
          if (rental.payments) {
            const overdueCount = rental.payments.filter((payment) => {
              if (payment.periodEndDate) {
                const endDate = new Date(payment.periodEndDate);
                return endDate < today;
              }
              return false;
            }).length;
            return count + overdueCount;
          }
          return count;
        }, 0);

        // Get latest diagnostic
        const latestDiagnostic = patientDiagnostics.length > 0 
          ? patientDiagnostics.sort((a: DiagnosticData, b: DiagnosticData) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : null;

        // Calculate last activity
        const allActivities = [
          ...patientDiagnostics.map((d: DiagnosticData) => new Date(d.date)),
          ...patientSales.map((s: SaleData) => new Date(s.date)),
          ...patientRentals.map((r: RentalData) => new Date(r.startDate))
        ];
        const lastActivity = allActivities.length > 0 
          ? allActivities.sort((a, b) => b.getTime() - a.getTime())[0].toISOString()
          : null;

        return {
          ...patient,
          diagnostics: patientDiagnostics,
          sales: patientSales,
          rentals: patientRentals,
          latestDiagnostic,
          totalSales,
          activeRentals,
          overduePayments,
          lastActivity
        };
      });

      setPatients(extendedPatients);
      setFilteredPatients(extendedPatients);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch("/api/technicians");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des techniciens");
      }
      const data = await response.json();
      setTechnicians(data);
    } catch (err) {
      console.error("Erreur lors du chargement des techniciens:", err);
    }
  };

  const handleAddPatient = async (patientData: PatientFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout du patient");
      }
      
      setShowAddPatientModal(false);
      fetchPatientsWithAggregatedData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setShowEditPatientModal(true);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients(prevPatients => 
      prevPatients.map(p => p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p)
    );
    setFilteredPatients(prevPatients => 
      prevPatients.map(p => p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p)
    );
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActivityStats = () => {
    const stats = { 
      total: filteredPatients.length,
      withDiagnostics: filteredPatients.filter(p => p.diagnostics && p.diagnostics.length > 0).length,
      withSales: filteredPatients.filter(p => p.sales && p.sales.length > 0).length,
      withActiveRentals: filteredPatients.filter(p => p.activeRentals && p.activeRentals > 0).length,
      withOverduePayments: filteredPatients.filter(p => p.overduePayments && p.overduePayments > 0).length
    };
    return stats;
  };

  const renderAddPatientModal = () => {
    return (
      <Modal 
        isOpen={showAddPatientModal} 
        onClose={() => setShowAddPatientModal(false)} 
        title="Ajouter un patient"
      >
        <PatientForm 
          onSubmit={handleAddPatient}
          onCancel={() => setShowAddPatientModal(false)}
          isLoading={isLoading}
          technicians={technicians}
          currentTechnicianId={currentUserId}
        />
      </Modal>
    );
  };

  const renderEditPatientModal = () => {
    if (!currentPatient) return null;
    
    return (
      <PatientEditModal
        isOpen={showEditPatientModal}
        onClose={() => setShowEditPatientModal(false)}
        onPatientUpdated={handlePatientUpdated}
        patient={currentPatient}
        technicians={technicians}
        currentTechnicianId={currentUserId}
      />
    );
  };

  if (isLoading && patients.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-600 font-medium">Chargement des patients...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activityStats = getActivityStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion des patients</h1>
          <p className="text-slate-600 mt-1">Vue d&apos;ensemble complète de tous vos patients</p>
        </div>
        <button
          onClick={() => setShowAddPatientModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Ajouter un patient
        </button>

        <Link href="/admin/dashboard" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"> 
          Retour à la page d&apos;accueil
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Patients ({filteredPatients.length})</h3>
            <div className="flex items-center space-x-4 text-blue-100 text-sm">
              <div>Diagnostics: {activityStats.withDiagnostics}</div>
              <div>Ventes: {activityStats.withSales}</div>
              <div>Locations actives: {activityStats.withActiveRentals}</div>
              <div>Paiements en retard: {activityStats.withOverduePayments}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
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

        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Activity className="h-10 w-10 text-slate-400" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">
              {searchTerm ? "Aucun patient ne correspond à votre recherche" : "Aucun patient enregistré"}
            </h4>
            <p className="text-slate-600 mb-6">
              {searchTerm ? "Essayez de modifier vos critères de recherche" : "Commencez par ajouter votre premier patient"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddPatientModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter un patient
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Patient
                        {sortBy === "name" && (
                          <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
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
                      onClick={() => handleSort("totalSales")}
                    >
                      <div className="flex items-center">
                        Ventes totales
                        {sortBy === "totalSales" && (
                          <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("activeRentals")}
                    >
                      <div className="flex items-center">
                        Locations actives
                        {sortBy === "activeRentals" && (
                          <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("lastActivity")}
                    >
                      <div className="flex items-center">
                        Dernière activité
                        {sortBy === "lastActivity" && (
                          <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Créé par
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {currentPatients.map((patient, index) => {
                    const latestDiagnostic = patient.latestDiagnostic;
                    const severity = latestDiagnostic ? calculateIAHSeverity(latestDiagnostic.iahResult) : null;
                    
                    return (
                      <tr 
                        key={patient.id} 
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
                          <div className="flex flex-col space-y-1">
                            {patient.overduePayments && patient.overduePayments > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {patient.overduePayments} en retard
                              </span>
                            ) : patient.activeRentals && patient.activeRentals > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                À jour
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Inactif
                              </span>
                            )}
                            
                            {patient.diagnostics && patient.diagnostics.length > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Activity className="w-3 h-3 mr-1" />
                                {patient.diagnostics.length} diagnostic(s)
                              </span>
                            )}
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
                            {patient.createdBy ? `${patient.createdBy.name} (${patient.createdBy.email})` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPatient(patient)}
                              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                              title="Modifier"
                            >
                              <Pencil size={16} className="mr-1" />
                              Modifier
                            </button>
                            <Link
                              href={`/employee/patients/${patient.id}`}
                              className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                              title="Voir les détails"
                            >
                              <FileText size={16} className="mr-1" />
                              Détails
                            </Link>
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
                      Affichage de {startIndex + 1} à {Math.min(endIndex, filteredPatients.length)} sur {filteredPatients.length} patients
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
                            ? 'bg-blue-600 text-white'
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
          </>
        )}
      </div>
      
      {renderAddPatientModal()}
      {renderEditPatientModal()}
    </div>
  );
}
