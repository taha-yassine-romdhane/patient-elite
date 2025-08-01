"use client";

import { useState, useEffect } from "react";
import { Technician } from "@prisma/client";
import PatientCreationModal from "@/components/patients/PatientCreationModal";
import { fetchWithAuth } from "@/lib/apiClient";

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  doctorName?: string;
  createdAt?: string;
};



interface PatientSelectionStepProps {
  onPatientSelect: (patient: Patient) => void;
}

export default function PatientSelectionStep({ onPatientSelect }: PatientSelectionStepProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    // Fetch patients and technicians when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [patientsResponse, techniciansResponse] = await Promise.all([
          fetchWithAuth("/api/patients"),
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
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
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



  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">Sélectionner un patient</h2>
        <p className="text-purple-100">Choisissez le patient pour lequel vous souhaitez créer une location</p>
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
              className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-slate-600 font-medium">Chargement des patients...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
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
            <button
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
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
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium inline-block"
            >
              Ajouter un nouveau patient
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-purple-100 overflow-hidden shadow-sm">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                      Région
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                      Médecin
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-semibold text-purple-800 uppercase tracking-wider sticky right-0 bg-gradient-to-r from-purple-50 to-indigo-50">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredPatients.map((patient, index) => (
                    <tr 
                      key={patient.id} 
                      className={`hover:bg-purple-25 transition-colors duration-150 border-b border-purple-50 ${index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                              {patient.fullName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-semibold text-slate-900">{patient.fullName}</div>
                            <div className="text-xs text-purple-600">
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
                          onClick={() => onPatientSelect(patient)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
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
              <div className="bg-purple-25 px-4 py-2 border-t border-purple-100">
                <p className="text-xs text-purple-700 font-medium">
                  {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouvé{filteredPatients.length > 1 ? 's' : ''}
                  {searchTerm && ` pour "${searchTerm}"`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Patient Creation Modal */}
      <PatientCreationModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        technicians={technicians}
        onPatientCreated={(newPatient) => {
          // Add the new patient to the list and select it
          // The API returns the full patient object with id, but the type is PatientFormData
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const patientResponse = newPatient as any;
          const patientForList: Patient = {
            id: patientResponse.id,
            fullName: patientResponse.fullName,
            phone: patientResponse.phone,
            region: patientResponse.region,
            address: patientResponse.address,
            doctorName: patientResponse.doctorName,
            createdAt: new Date().toISOString()
          };
          
          setPatients(prevPatients => [patientForList, ...prevPatients]);
          setFilteredPatients(prevPatients => [patientForList, ...prevPatients]);
          onPatientSelect(patientForList);
        }}
      />
    </div>
  );
}
