"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PatientLoadingSkeleton from "@/components/patients/PatientLoadingSkeleton";
import PatientOverview from "@/components/patients/PatientOverview";
import PatientRentalsTracker from "@/components/patients/PatientRentalsTracker";
import PatientSalesTracker from "@/components/patients/PatientSalesTracker";
import PatientDiagnosticsTracker from "@/components/patients/PatientDiagnosticsTracker";
import PatientPaymentsTracker from "@/components/patients/PatientPaymentsTracker";
import PatientDevicesTracker from "@/components/patients/PatientDevicesTracker";
import { Patient } from "@/types/patient";

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}`);
        
        if (!response.ok) {
          throw new Error("Impossible de récupérer les données du patient");
        }
        
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient details:", err);
        setError(err instanceof Error ? err.message : "Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientDetails();
  }, [patientId, refreshKey]);

  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
  };

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: "📊" },
    { id: "rentals", label: "Locations", icon: "🏠" },
    { id: "sales", label: "Ventes", icon: "💰" },
    { id: "diagnostics", label: "Diagnostics", icon: "🔬" },
    { id: "payments", label: "Paiements", icon: "💳" },
    { id: "devices", label: "Appareils", icon: "🔧" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-800">Détails du patient</h1>
            <Link
              href="/employee/patients"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à la liste
            </Link>
          </div>
          <PatientLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-800">Détails du patient</h1>
            <Link
              href="/employee/patients"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à la liste
            </Link>
          </div>
          <div className="bg-red-50 p-6 rounded-lg text-red-700">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">Erreur</p>
            </div>
            <p>{error || "Patient non trouvé"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-800">
              Dossier patient: {patient.fullName}
            </h1>
            <p className="text-gray-600 mt-1">
              Suivi complet des activités et transactions
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/employee/diagnostics?patientId=${patient.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Nouveau diagnostic
            </button>
            <button
              onClick={() => router.push(`/employee/sales?patientId=${patient.id}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Nouvelle vente
            </button>
            <button
              onClick={() => router.push(`/employee/rentals?patientId=${patient.id}`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 7h10v6H7v-6z" />
              </svg>
              Nouvelle location
            </button>
            <Link
              href="/employee/patients"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à la liste
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center mr-8 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <PatientOverview 
              patient={patient} 
              onPatientUpdate={handlePatientUpdate}
            />
          )}
          
          {activeTab === "rentals" && (
            <PatientRentalsTracker 
              rentals={patient.rentals?.map(rental => ({
                ...rental,
                payments: rental.payments || [],
                rentalItems: rental.rentalItems || []
              })) || []} 
              patientId={patient.id}
              onRentalUpdate={handleDataUpdate}
            />
          )}
          
          {activeTab === "sales" && (
            <PatientSalesTracker 
              sales={patient.sales?.map(sale => ({
                ...sale,
                payments: sale.payments || []
              })) || []} 
              patientId={patient.id}
              onSaleUpdate={handleDataUpdate}
            />
          )}
          
          {activeTab === "diagnostics" && (
            <PatientDiagnosticsTracker 
              diagnostics={patient.diagnostics || []} 
              patientId={patient.id}
              onDiagnosticUpdate={handleDataUpdate}
            />
          )}
          
          {activeTab === "payments" && (
            <PatientPaymentsTracker 
              sales={patient.sales || []} 
              rentals={patient.rentals || []}
            />
          )}
          
          {activeTab === "devices" && (
            <PatientDevicesTracker 
              sales={patient.sales || []} 
              rentals={patient.rentals || []}
              patientId={patient.id}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </p>
          <p className="mt-2 text-sm">
            Système de gestion des patients - Patients Elite CRM
          </p>
        </div>
      </div>
    </div>
  );
}
