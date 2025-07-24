"use client";

import { useState, useEffect } from "react";
import Stepper from "@/components/ui/Stepper";
import PatientCreationModal from "@/components/patients/PatientCreationModal";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Technician } from "@prisma/client";
import { calculateIAHSeverity, validateIAHInput, formatIAHValue } from "@/utils/diagnosticUtils";
import { createDiagnosticTask, saveTasksToLocalStorage } from "@/utils/taskUtils";
import { fetchWithAuth } from "@/lib/apiClient";

// Define TypeScript types based on our Prisma schema
type Patient = {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address: string;
  doctorName: string;
  createdAt?: string;
};

type PolygraphType = "NOX" | "PORTI" | "APNEALINK" | "ALICE";

export default function DiagnosticStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);
  
  // Diagnostic form data
  const [diagnosticData, setDiagnosticData] = useState({
    date: new Date().toISOString().split("T")[0],
    polygraph: "NOX" as PolygraphType,
    iahResult: "",
    idResult: "",
    remarks: "",
  });

  const steps = ["Sélection du patient", "Détails du diagnostic", "Confirmation"];

  useEffect(() => {
    // Fetch patients and technicians
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientsResponse, techniciansResponse] = await Promise.all([
          fetchWithAuth("/api/admin/patients"),
          fetch("/api/technicians")
        ]);
        
        if (!patientsResponse.ok) {
          throw new Error("Erreur lors de la récupération des patients");
        }
        if (!techniciansResponse.ok) {
          throw new Error("Erreur lors de la récupération des techniciens");
        }
        
        const patientsData = await patientsResponse.json();
        const techniciansData = await techniciansResponse.json();
        
        setPatients(patientsData);
        setFilteredPatients(patientsData);
        setTechnicians(techniciansData);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm) ||
          patient.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Calculate severity when IAH changes
  const currentSeverity = diagnosticData.iahResult ? 
    (() => {
      const validation = validateIAHInput(diagnosticData.iahResult);
      return validation.isValid && validation.numericValue !== undefined 
        ? calculateIAHSeverity(validation.numericValue) 
        : null;
    })() : null;

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep(1);
  };

  const handleDiagnosticChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDiagnosticData({
      ...diagnosticData,
      [name]: value,
    });
  };

  const handleDateChange = (value: string) => {
    setDiagnosticData({
      ...diagnosticData,
      date: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setDiagnosticData({
      ...diagnosticData,
      [name]: value,
    });
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    
    try {
      const response = await fetchWithAuth("/api/diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          date: new Date(diagnosticData.date).toISOString(),
          polygraph: diagnosticData.polygraph,
          iahResult: parseFloat(diagnosticData.iahResult),
          idResult: parseFloat(diagnosticData.idResult),
          remarks: diagnosticData.remarks,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du diagnostic");
      }

      const result = await response.json();
      
      // Create calendar task for severe cases
      if (result.success && result.data) {
        const diagnosticTask = createDiagnosticTask({
          ...result.data,
          patient: selectedPatient
        });
        
        if (diagnosticTask) {
          saveTasksToLocalStorage([diagnosticTask]);
          console.log(`Created diagnostic follow-up task for severe case`);
        }
      }

      // Success - move to confirmation step
      handleNextStep();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Nouveau diagnostic</h1>
            <p className="text-slate-600">Créez un diagnostic complet pour un patient</p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm border border-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour au tableau de bord
          </button>
        </div>
        
        <div className="mb-10">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-sm mb-8" role="alert">
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
        )}

        <div className="max-w-7xl mx-auto">
          {/* Step 1: Patient Selection */}
          {currentStep === 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">Sélectionner un patient</h2>
                <p className="text-blue-100">Choisissez le patient pour lequel vous souhaitez créer un diagnostic</p>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher par nom, téléphone ou région..."
                      className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowPatientModal(true)} 
                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-sm flex items-center whitespace-nowrap"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nouveau patient
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-slate-600 font-medium">Chargement des patients...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Aucun patient trouvé</h3>
                    <p className="text-slate-600 mb-6">
                      {searchTerm ? "Aucun patient ne correspond à votre recherche" : "Aucun patient enregistré dans le système"}
                    </p>
                    <button
                      onClick={() => setShowPatientModal(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Ajouter un nouveau patient
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                    <div className="max-h-[60vh] overflow-y-auto">
                      <table className="min-w-full">
                        <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                              Patient
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                              Contact
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                              Région
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">
                              Médecin
                            </th>
                            <th scope="col" className="px-3 py-2 text-center text-xs font-semibold text-blue-800 uppercase tracking-wider sticky right-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {filteredPatients.map((patient, index) => (
                            <tr 
                              key={patient.id} 
                              className={`hover:bg-blue-25 transition-colors duration-150 border-b border-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}
                            >
                              <td className="px-3 py-2.5">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                      {patient.fullName.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-semibold text-slate-900">{patient.fullName}</div>
                                    <div className="text-xs text-blue-600">
                                      {patient.createdAt && new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="text-sm font-medium text-slate-900">{patient.phone}</div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="text-sm font-medium text-slate-900">{patient.region}</div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="text-sm font-medium text-slate-900">{patient.doctorName || "Non spécifié"}</div>
                              </td>
                              <td className="px-3 py-2.5 text-center sticky right-0 bg-white">
                                <button
                                  onClick={() => handlePatientSelect(patient)}
                                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  Sélectionner
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredPatients.length > 0 && (
                      <div className="bg-blue-25 px-4 py-2 border-t border-blue-100">
                        <p className="text-xs text-blue-700 font-medium">
                          {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouvé{filteredPatients.length > 1 ? 's' : ''}
                          {searchTerm && ` pour "${searchTerm}"`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Diagnostic Details */}
          {currentStep === 1 && selectedPatient && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">Détails du diagnostic</h2>
                <p className="text-indigo-100">Saisissez les résultats du diagnostic</p>
              </div>
              
              <div className="p-8">
                {/* Patient Info Card */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                        {selectedPatient.fullName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold text-slate-800">{selectedPatient.fullName}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedPatient.phone}
                        </span>
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {selectedPatient.region}
                        </span>
                        {selectedPatient.doctorName && (
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Dr. {selectedPatient.doctorName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-8">
                  {/* Date and Polygraph */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <DatePicker
                        label="Date du diagnostic"
                        value={diagnosticData.date}
                        onChange={handleDateChange}
                        placeholder="jj/mm/aaaa"
                        className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Type de polygraphe
                      </Label>
                      <Select
                        value={diagnosticData.polygraph}
                        onValueChange={(value) => handleSelectChange('polygraph', value)}
                      >
                        <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200">
                          <SelectValue placeholder="Sélectionnez un polygraphe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOX">NOX</SelectItem>
                          <SelectItem value="PORTI">PORTI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Results Section */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Résultats du diagnostic
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          Indice d&apos;Apnée-Hypopnée (IAH)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="200"
                          name="iahResult"
                          value={diagnosticData.iahResult}
                          onChange={handleDiagnosticChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Ex: 25.3"
                          required
                        />
                        <p className="text-xs text-slate-500">Nombre d&apos;événements respiratoires par heure</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">
                          Indice de Désaturation (ID)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          name="idResult"
                          value={diagnosticData.idResult}
                          onChange={handleDiagnosticChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          placeholder="Ex: 18.7"
                          required
                        />
                        <p className="text-xs text-slate-500">Nombre de désaturations par heure</p>
                      </div>
                    </div>

                    {/* Real-time IAH Severity Display */}
                    {currentSeverity && (
                      <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-1">Interprétation du résultat IAH</h4>
                            <p className="text-xs text-slate-500">Basé sur la valeur: {formatIAHValue(parseFloat(diagnosticData.iahResult))}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentSeverity.bgColor} ${currentSeverity.textColor}`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${currentSeverity.color === 'emerald' ? 'bg-emerald-500' : currentSeverity.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                              {currentSeverity.labelFr}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-600">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="text-emerald-600 font-medium">0-15</div>
                              <div>Négatif</div>
                            </div>
                            <div className="text-center">
                              <div className="text-amber-600 font-medium">15-29</div>
                              <div>Modéré</div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-600 font-medium">30+</div>
                              <div>Sévère</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Remarques et observations
                    </Label>
                    <Textarea
                      name="remarks"
                      value={diagnosticData.remarks}
                      onChange={handleDiagnosticChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Ajoutez vos observations cliniques, recommandations ou notes particulières..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 2 && selectedPatient && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-white">Diagnostic créé avec succès!</h2>
                    <p className="text-emerald-100 mt-1">Le diagnostic pour {selectedPatient.fullName} a été enregistré dans le système.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Patient Details */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Informations patient
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Nom complet:</span>
                        <span className="text-slate-900 font-semibold">{selectedPatient.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Téléphone:</span>
                        <span className="text-slate-900">{selectedPatient.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Région:</span>
                        <span className="text-slate-900">{selectedPatient.region}</span>
                      </div>
                      {selectedPatient.doctorName && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-medium">Médecin:</span>
                          <span className="text-slate-900">Dr. {selectedPatient.doctorName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Diagnostic Results */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Résultats diagnostic
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Date:</span>
                        <span className="text-slate-900">{new Date(diagnosticData.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Polygraphe:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {diagnosticData.polygraph}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">IAH:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-900 font-bold">{formatIAHValue(parseFloat(diagnosticData.iahResult))}</span>
                          {currentSeverity && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentSeverity.bgColor} ${currentSeverity.textColor}`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                currentSeverity.color === 'emerald' ? 'bg-emerald-500' : 
                                currentSeverity.color === 'amber' ? 'bg-amber-500' : 
                                'bg-red-500'
                              }`}></div>
                              {currentSeverity.labelFr}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">ID:</span>
                        <span className="text-slate-900 font-bold">{formatIAHValue(parseFloat(diagnosticData.idResult))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks Section */}
                {diagnosticData.remarks && (
                  <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Remarques et observations
                    </h3>
                    <p className="text-slate-700 leading-relaxed">{diagnosticData.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between items-center">
            {currentStep > 0 && currentStep < 2 && (
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm font-medium"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour
              </button>
            )}
            
            {currentStep === 0 && (
              <div></div> // Empty div for flex spacing
            )}
            
            {currentStep === 1 && (
              <button
                onClick={handleSubmit}
                disabled={!diagnosticData.iahResult || !diagnosticData.idResult}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer le diagnostic
              </button>
            )}
            
            {currentStep === 2 && (
              <div className="flex gap-4 ml-auto">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm font-medium"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Tableau de bord
                </Link>
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setSelectedPatient(null);
                    setDiagnosticData({
                      date: new Date().toISOString().split("T")[0],
                      polygraph: "NOX",
                      iahResult: "",
                      idResult: "",
                      remarks: "",
                    });
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nouveau diagnostic
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Patient Creation Modal */}
      <PatientCreationModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        technicians={technicians}
        onPatientCreated={(newPatient) => {
          // Add the new patient to the list and select it
          setPatients(prevPatients => [newPatient as unknown as Patient, ...prevPatients]);
          setFilteredPatients(prevPatients => [newPatient as unknown as Patient, ...prevPatients]);
          setSelectedPatient(newPatient as unknown as Patient);
          setCurrentStep(1); // Move to the next step
        }}
      />
    </div>
  );
}
