"use client";

import { Patient } from "@/types/patient";
import { useState } from "react";
import PatientEditModal from "./PatientEditModal";
import { Patient as PrismaPatient } from "@prisma/client";

interface PatientOverviewProps {
  patient: Patient;
  onPatientUpdate?: (updatedPatient: Patient) => void;
}

export default function PatientOverview({ patient, onPatientUpdate }: PatientOverviewProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  // Calculate statistics
  const totalRentals = patient.rentals?.length || 0;
  const totalSales = patient.sales?.length || 0;
  const totalDiagnostics = patient.diagnostics?.length || 0;

  // Calculate active rentals (not returned)
  const activeRentals = patient.rentals?.filter(
    rental => rental.returnStatus === "NOT_RETURNED"
  ).length || 0;

  // Calculate outstanding balances from rentals
  const outstandingBalance = patient.rentals?.reduce((total, rental) => {
    if (rental.rentalItems) {
      return total + rental.rentalItems.reduce((itemTotal, item) => {
        const totalPaid = item.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        return itemTotal + (item.totalPrice - totalPaid);
      }, 0);
    }
    return total;
  }, 0) || 0;

  // Calculate total revenue from sales
  const totalSalesRevenue = patient.sales?.reduce((total, sale) => total + sale.amount, 0) || 0;



  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity: Array<{
    type: 'rental' | 'sale' | 'diagnostic';
    date: string;
    description: string;
    amount: number;
  }> = [];

  // Add recent rentals
  patient.rentals?.forEach(rental => {
    if (new Date(rental.createdAt) >= thirtyDaysAgo) {
      recentActivity.push({
        type: 'rental',
        date: rental.createdAt,
        description: `Nouvelle location - ${rental.rentalItems?.length || 0} élément(s)`,
        amount: rental.amount
      });
    }
  });

  // Add recent sales
  patient.sales?.forEach(sale => {
    if (new Date(sale.createdAt) >= thirtyDaysAgo) {
      recentActivity.push({
        type: 'sale',
        date: sale.createdAt,
        description: `Nouvelle vente - ${(sale.devices?.length || 0) + (sale.accessories?.length || 0)} élément(s)`,
        amount: sale.amount
      });
    }
  });

  // Add recent diagnostics
  patient.diagnostics?.forEach(diagnostic => {
    if (new Date(diagnostic.createdAt) >= thirtyDaysAgo) {
      recentActivity.push({
        type: 'diagnostic',
        date: diagnostic.createdAt,
        description: `Nouveau diagnostic - ${diagnostic.polygraph}`,
        amount: 0
      });
    }
  });



  // Get devices that need attention (rentals ending soon)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const rentalsEndingSoon = patient.rentals?.filter(rental => {
    return rental.returnStatus === "NOT_RETURNED" && new Date(rental.endDate) <= sevenDaysFromNow;
  }) || [];

  const handlePatientUpdate = (updatedPatient: PrismaPatient) => {
    // Convert Prisma Patient back to our local Patient type
    const convertedPatient: Patient = {
      ...updatedPatient,
      date: updatedPatient.date.toISOString(),
      createdAt: updatedPatient.createdAt.toISOString(),
      updatedAt: updatedPatient.updatedAt.toISOString()
    } as Patient;
    
    if (onPatientUpdate) {
      onPatientUpdate(convertedPatient);
    }
    setShowEditModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{patient.fullName}</h2>
          <p className="text-gray-600 mt-1">
            Patient depuis le {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Modifier
        </button>
      </div>

      {/* Patient Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Informations de contact</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Téléphone:</strong> {patient.phone}</p>
            <p><strong>Région:</strong> {patient.region}</p>
            <p><strong>Adresse:</strong> {patient.address}</p>
            {patient.addressDetails && <p><strong>Détails:</strong> {patient.addressDetails}</p>}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Informations médicales</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Médecin:</strong> {patient.doctorName}</p>
            {patient.cin && <p><strong>CIN:</strong> {patient.cin}</p>}
            {patient.hasCnam && (
              <>
                <p><strong>CNAM:</strong> Oui</p>
                {patient.cnamId && <p><strong>ID CNAM:</strong> {patient.cnamId}</p>}
                {patient.affiliation && <p><strong>Affiliation:</strong> {patient.affiliation}</p>}
                {patient.beneficiary && <p><strong>Bénéficiaire:</strong> {patient.beneficiary}</p>}
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Équipe médicale</h3>
          <div className="space-y-2 text-sm">
            {patient.technician && (
              <p><strong>Technicien:</strong> {patient.technician.name}</p>
            )}
            {patient.supervisor && (
              <p><strong>Superviseur:</strong> {patient.supervisor.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Locations totales</p>
              <p className="text-2xl font-bold">{totalRentals}</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V5a1 1 0 00-1-1V3a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-blue-100 text-xs mt-1">{activeRentals} active(s)</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Ventes totales</p>
              <p className="text-2xl font-bold">{totalSales}</p>
            </div>
            <div className="text-green-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-green-100 text-xs mt-1">{totalSalesRevenue.toFixed(2)} TND</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Diagnostics</p>
              <p className="text-2xl font-bold">{totalDiagnostics}</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-purple-100 text-xs mt-1">Suivi médical</p>
        </div>

        <div className={`bg-gradient-to-r ${outstandingBalance > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white p-4 rounded-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Solde restant</p>
              <p className="text-2xl font-bold">{outstandingBalance.toFixed(2)} TND</p>
            </div>
            <div className="text-white opacity-75">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-white text-xs mt-1 opacity-90">
            {outstandingBalance > 0 ? 'Paiement requis' : 'Tout payé'}
          </p>
        </div>
      </div>

      {/* Alerts and Notifications */}
      {(rentalsEndingSoon.length > 0 || outstandingBalance > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Alertes et notifications
          </h3>
          <div className="space-y-2 text-sm">
            {outstandingBalance > 0 && (
              <p className="text-yellow-700">
                • Solde impayé de {outstandingBalance.toFixed(2)} TND
              </p>
            )}
            {rentalsEndingSoon.length > 0 && (
              <p className="text-yellow-700">
                • {rentalsEndingSoon.length} location(s) se terminant dans les 7 prochains jours
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-4">Activité récente (30 derniers jours)</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Aucune activité récente</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'rental' ? 'bg-blue-500' :
                    activity.type === 'sale' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {activity.amount > 0 && (
                  <span className="text-sm font-medium text-gray-700">
                    {activity.amount.toFixed(2)} TND
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <PatientEditModal
          isOpen={true}
          patient={{
            ...patient,
            date: new Date(patient.date),
            createdAt: new Date(patient.createdAt),
            updatedAt: new Date(patient.updatedAt)
          } as PrismaPatient}
          onClose={() => setShowEditModal(false)}
          onPatientUpdated={handlePatientUpdate}
        />
      )}
    </div>
  );
} 