"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Activity, AlertCircle } from "lucide-react";
import { fetchWithAuth } from "@/lib/apiClient";
import { Technician } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import PatientEditModal from "@/components/patients/PatientEditModal";
import PatientFormDialog from "@/components/patients/PatientFormDialog";
import PatientFilters from "@/components/patients/PatientFilters";
import PatientStatsHeader from "@/components/patients/PatientStatsHeader";
import PatientTable from "@/components/patients/PatientTable";
import Pagination from "@/components/patients/Pagination";
import DeleteConfirmationModal from "@/components/patients/DeleteConfirmationModal";
import ExcelImportExport from "@/components/admin/patients/ExcelImportExport";
import { calculateIAHSeverity } from "@/utils/diagnosticUtils";
import { ExtendedPatient, Patient, ActivityStats } from "@/types/patient";
import { PatientFormData } from "@/components/PatientForm";

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


export default function PatientsPage() {
  const [patients, setPatients] = useState<ExtendedPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<ExtendedPatient[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosticFilter, setDiagnosticFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastActivity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const doctors = useMemo(() => {
    const allDoctors = patients
      .map(p => p.doctorName)
      .filter((name): name is string => !!name);
    return [...new Set(allDoctors)];
  }, [patients]);

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
            return !patient.overduePayments || patient.overduePayments === 0;
          default:
            return true;
        }
      });
    }

    // Apply doctor filter
    if (doctorFilter !== "all") {
      filtered = filtered.filter(patient => patient.doctorName === doctorFilter);
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
  }, [searchTerm, diagnosticFilter, activityFilter, paymentFilter, doctorFilter, sortBy, sortOrder, patients]);

  useEffect(() => {
    filterAndSortPatients();
  }, [filterAndSortPatients]);

  const fetchPatientsWithAggregatedData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients with all related data
      const [patientsRes, diagnosticsRes, salesRes, rentalsRes] = await Promise.all([
        fetchWithAuth("/api/patients"),
        fetchWithAuth("/api/diagnostics"),
        fetchWithAuth("/api/sales"),
        fetchWithAuth("/api/rentals")
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
      console.log('Submitting patient data:', patientData);
      const response = await fetchWithAuth("/api/patients", {
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
      
      const newPatient = await response.json();
      console.log('Patient created successfully:', newPatient);
      
      setShowAddPatientModal(false);
      fetchPatientsWithAggregatedData();
    } catch (err: unknown) {
      console.error('Error creating patient:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkImport = async (patientsData: PatientFormData[]) => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(
        patientsData.map(patientData =>
          fetchWithAuth("/api/patients", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patientData),
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to create patient: ${patientData.fullName}`);
            return res.json();
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        fetchPatientsWithAggregatedData();
      }
      
      if (failed > 0) {
        setError(`Import terminé: ${successful} réussis, ${failed} échoués`);
      } else {
        setError(`Import réussi: ${successful} patients importés`);
        setTimeout(() => setError(""), 3000);
      }
    } catch (err: unknown) {
      console.error('Bulk import error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'import en masse");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setShowEditPatientModal(true);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      const response = await fetchWithAuth(`/api/admin/patients?id=${patientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete patient');
      }

      // Update state to remove the deleted patient from the list
      setPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));
      setFilteredPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));

      // Close the modal and reset state
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Deletion failed:', error.message);
      // Optionally, show an error message to the user
    }
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

  const getActivityStats = (): ActivityStats => {
    return { 
      total: filteredPatients.length,
      withDiagnostics: filteredPatients.filter(p => p.diagnostics && p.diagnostics.length > 0).length,
      withSales: filteredPatients.filter(p => p.sales && p.sales.length > 0).length,
      withActiveRentals: filteredPatients.filter(p => p.activeRentals && p.activeRentals > 0).length,
      withOverduePayments: filteredPatients.filter(p => p.overduePayments && p.overduePayments > 0).length
    };
  };

  const renderAddPatientModal = () => {
    return (
      <PatientFormDialog
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        title="Ajouter un patient"
        onSubmit={handleAddPatient}
        isLoading={isLoading}
        technicians={technicians}
        currentTechnicianId={currentUserId}
      />
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

  const activityStats = getActivityStats();

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <AdminPageHeader 
          title="Gestion des patients" 
          description="Chargement..."
        />
        <main className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-600 font-medium">Chargement des patients...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <AdminPageHeader 
          title="Gestion des patients" 
          description="Erreur lors du chargement"
        />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl">
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
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <AdminPageHeader 
        title="Gestion des patients" 
        description="Vue d'ensemble complète de tous vos patients"
      >
        <button
          onClick={() => setShowAddPatientModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          Ajouter un patient
        </button>
      </AdminPageHeader>

      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          {/* Excel Import/Export Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <ExcelImportExport 
              patients={patients}
              technicians={technicians}
              onImport={handleBulkImport}
              isLoading={isLoading}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <PatientStatsHeader 
          filteredPatientsCount={filteredPatients.length}
          activityStats={activityStats}
        />

        <PatientFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          diagnosticFilter={diagnosticFilter}
          setDiagnosticFilter={setDiagnosticFilter}
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter}
          paymentFilter={paymentFilter}
          setPaymentFilter={setPaymentFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          doctors={doctors}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Activity className="h-10 w-10 text-slate-400" />
            </div>
            <h4 className="text-xl font-semibold text-slate-900 mb-2">
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
            <PatientTable
              patients={currentPatients}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={handleEditPatient}
              onDelete={handleDeleteClick}
              formatDate={formatDate}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPatients.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
          )}
          </div>
          
          {renderAddPatientModal()}
          {renderEditPatientModal()}

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            patient={patientToDelete}
          />
        </div>
      </main>
    </div>
  );
}
