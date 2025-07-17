"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RentalItem {
  id: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  device?: {
    id: string;
    name: string;
    model: string;
    serialNumber: string;
  };
  accessory?: {
    id: string;
    name: string;
    model: string;
    quantity: number;
  };
  payments: {
    id: string;
    amount: number;
    type: string;
    paymentDate: string;
    periodStartDate?: string;
    periodEndDate?: string;
    notes?: string;
  }[];
}

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  returnStatus: string;
  notes?: string;
  actualReturnDate?: string;
  createdAt: string;
  updatedAt: string;
  rentalItems: RentalItem[];
  payments: {
    id: string;
    amount: number;
    type: string;
    paymentDate: string;
    notes?: string;
  }[];
}

interface PatientRentalsTrackerProps {
  rentals: Rental[];
  patientId: string;
  onRentalUpdate?: () => void;
}

export default function PatientRentalsTracker({ rentals, patientId, onRentalUpdate }: PatientRentalsTrackerProps) {
  const router = useRouter();
  const [expandedRental, setExpandedRental] = useState<string | null>(null);
  const [showExtensionModal, setShowExtensionModal] = useState<string | null>(null);
  const [extensionDate, setExtensionDate] = useState("");
  const [extensionNotes, setExtensionNotes] = useState("");
  const [isExtending, setIsExtending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort rentals
  const filteredRentals = rentals.filter(rental => {
    if (!rental) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return rental.returnStatus === 'NOT_RETURNED';
    if (filterStatus === 'completed') return rental.returnStatus === 'RETURNED';
    if (filterStatus === 'overdue') {
      const today = new Date();
      return rental.returnStatus === 'NOT_RETURNED' && new Date(rental.endDate) < today;
    }
    return true;
  });

  const sortedRentals = [...filteredRentals].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else {
      return sortOrder === 'asc' ? a.returnStatus.localeCompare(b.returnStatus) : b.returnStatus.localeCompare(a.returnStatus);
    }
  });

  // Calculate statistics
  const activeRentals = rentals.filter(rental => rental?.returnStatus === "NOT_RETURNED");
  const completedRentals = rentals.filter(rental => rental?.returnStatus === "RETURNED");
  const totalRevenue = rentals.reduce((sum, rental) => sum + (rental?.amount || 0), 0);
  const totalOutstanding = rentals.reduce((total, rental) => {
    if (!rental || !Array.isArray(rental.rentalItems)) return total;
    
    return total + rental.rentalItems.reduce((itemTotal, item) => {
      if (!item || !Array.isArray(item.payments)) return itemTotal;
      
      const totalPaid = item.payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0);
      return itemTotal + ((item.totalPrice || 0) - totalPaid);
    }, 0);
  }, 0);

  // Get rentals ending soon (within 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const rentalsEndingSoon = activeRentals.filter(rental => 
    rental?.endDate && new Date(rental.endDate) <= sevenDaysFromNow
  );

  // Get overdue rentals
  const today = new Date();
  const overdueRentals = activeRentals.filter(rental => 
    rental?.endDate && new Date(rental.endDate) < today
  );

  const handleExtendRental = async (rentalId: string) => {
    if (!extensionDate) return;
    
    setIsExtending(true);
    try {
      const response = await fetch(`/api/rentals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: rentalId,
          extendEndDate: extensionDate,
          notes: extensionNotes,
          returnStatus: "NOT_RETURNED"
        }),
      });

      if (response.ok) {
        setShowExtensionModal(null);
        setExtensionDate("");
        setExtensionNotes("");
        if (onRentalUpdate) onRentalUpdate();
      } else {
        alert("Erreur lors de l'extension de la location");
      }
    } catch (error) {
      console.error("Error extending rental:", error);
      alert("Erreur lors de l'extension de la location");
    } finally {
      setIsExtending(false);
    }
  };

  const handleReturnRental = async (rentalId: string) => {
    const returnDate = new Date().toISOString().split('T')[0];
    
    try {
      const response = await fetch(`/api/rentals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: rentalId,
          returnDate: returnDate,
          returnStatus: "RETURNED",
          notes: "Retour confirmé"
        }),
      });

      if (response.ok) {
        if (onRentalUpdate) onRentalUpdate();
      } else {
        alert("Erreur lors du retour de la location");
      }
    } catch (error) {
      console.error("Error returning rental:", error);
      alert("Erreur lors du retour de la location");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_RETURNED":
        return "bg-blue-100 text-blue-800";
      case "RETURNED":
        return "bg-green-100 text-green-800";
      case "PARTIALLY_RETURNED":
        return "bg-orange-100 text-orange-800";
      case "DAMAGED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "CASH":
        return "bg-green-100 text-green-800";
      case "CNAM":
        return "bg-orange-100 text-orange-800";
      case "CHEQUE":
        return "bg-blue-100 text-blue-800";
      case "TRAITE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (item: RentalItem) => {
    if (!item || !Array.isArray(item.payments)) return "bg-gray-100 text-gray-800";
    
    const totalPaid = item.payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0);
    const outstanding = (item.totalPrice || 0) - totalPaid;
    
    if (outstanding <= 0) return "bg-green-100 text-green-800";
    if (outstanding < (item.totalPrice || 0) * 0.5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDaysUntilEnd = (endDate: string) => {
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getRentalDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!Array.isArray(rentals) || rentals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Locations</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">Aucune location enregistrée</p>
          <button
            onClick={() => router.push(`/employee/rentals?patientId=${patientId}`)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Créer une location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Locations</h2>
        <button
          onClick={() => router.push(`/employee/rentals?patientId=${patientId}`)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle location
        </button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Locations actives</p>
          <p className="text-2xl font-bold text-blue-700">{activeRentals.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Locations terminées</p>
          <p className="text-2xl font-bold text-green-700">{completedRentals.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Se terminant bientôt</p>
          <p className="text-2xl font-bold text-yellow-700">{rentalsEndingSoon.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600">Solde impayé</p>
          <p className="text-2xl font-bold text-red-700">{formatPrice(totalOutstanding)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Revenus total</p>
          <p className="text-2xl font-bold text-purple-700">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Enhanced Alerts */}
      {(overdueRentals.length > 0 || rentalsEndingSoon.length > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="font-medium text-yellow-800">Alertes importantes</h3>
          </div>
          <div className="space-y-1">
            {overdueRentals.length > 0 && (
              <div className="flex items-center text-sm text-red-700">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {overdueRentals.length} location(s) en retard nécessitent une attention immédiate
              </div>
            )}
            {rentalsEndingSoon.length > 0 && (
              <div className="flex items-center text-sm text-yellow-700">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                {rentalsEndingSoon.length} location(s) se terminent dans les 7 prochains jours
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Statut:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Tous</option>
            <option value="active">Actives</option>
            <option value="completed">Terminées</option>
            <option value="overdue">En retard</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Trier par:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="date">Date</option>
            <option value="amount">Montant</option>
            <option value="status">Statut</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
        >
          {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
        </button>

        <div className="text-sm text-gray-600">
          Affichage: {sortedRentals.length} sur {rentals.length} locations
        </div>
      </div>

      {/* Enhanced Rentals List */}
      <div className="space-y-4">
        {sortedRentals.map((rental) => {
          if (!rental) return null;
          
          const daysUntilEnd = getDaysUntilEnd(rental.endDate);
          const isExpanded = expandedRental === rental.id;
          const duration = getRentalDuration(rental.startDate, rental.endDate);
          const outstandingAmount = Array.isArray(rental.rentalItems) ? rental.rentalItems.reduce((total, item) => {
            if (!item || !Array.isArray(item.payments)) return total;
            const totalPaid = item.payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0);
            return total + ((item.totalPrice || 0) - totalPaid);
          }, 0) : 0;

          return (
            <div key={rental.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">
                          Location #{rental.id.slice(-8)}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(rental.returnStatus)}`}>
                        {rental.returnStatus === "NOT_RETURNED" ? "En cours" : 
                         rental.returnStatus === "RETURNED" ? "Terminée" : 
                         rental.returnStatus === "PARTIALLY_RETURNED" ? "Partiellement retournée" :
                         rental.returnStatus === "DAMAGED" ? "Endommagée" : rental.returnStatus}
                      </span>
                      {rental.returnStatus === "NOT_RETURNED" && (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          daysUntilEnd <= 0 ? "bg-red-100 text-red-800" :
                          daysUntilEnd <= 7 ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {daysUntilEnd <= 0 ? `${Math.abs(daysUntilEnd)} jours de retard` :
                           daysUntilEnd <= 7 ? `${daysUntilEnd} jours restants` :
                           `${daysUntilEnd} jours restants`}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Période:</strong>
                        </p>
                        <p className="text-gray-900">
                          {new Date(rental.startDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-900">
                          {new Date(rental.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-gray-500 text-xs">
                          ({duration} jours)
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">
                          <strong>Montant:</strong>
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(rental.amount || 0)}
                        </p>
                        {outstandingAmount > 0 && (
                          <p className="text-red-600 text-sm font-medium">
                            {formatPrice(outstandingAmount)} impayé
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-gray-600">
                          <strong>Éléments:</strong>
                        </p>
                        <p className="text-gray-900">
                          {(rental.rentalItems || []).length} élément(s)
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(rental.rentalItems || []).slice(0, 3).map((item, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {item.device?.name || item.accessory?.name}
                            </span>
                          ))}
                          {(rental.rentalItems || []).length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{(rental.rentalItems || []).length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">
                          <strong>Paiements:</strong>
                        </p>
                        <p className="text-gray-900">
                          {(rental.payments || []).length} paiement(s)
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(rental.payments || []).slice(0, 2).map((payment, index) => (
                            <span key={index} className={`px-2 py-1 text-xs rounded ${getPaymentTypeColor(payment.type)}`}>
                              {payment.type}
                            </span>
                          ))}
                          {(rental.payments || []).length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{(rental.payments || []).length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {rental.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Notes:</strong> {rental.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {rental.returnStatus === "NOT_RETURNED" && (
                      <>
                        <button
                          onClick={() => setShowExtensionModal(rental.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Étendre
                        </button>
                        <button
                          onClick={() => handleReturnRental(rental.id)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Retourner
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedRental(isExpanded ? null : rental.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-white">
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Détails des éléments loués
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {(rental.rentalItems || []).map((item) => {
                        if (!item) return null;
                        
                        const totalPaid = Array.isArray(item.payments) ? item.payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0) : 0;
                        const outstanding = (item.totalPrice || 0) - totalPaid;
                        
                        return (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="font-medium text-gray-900">
                                    {item.device ? item.device.name : item.accessory?.name}
                                  </h5>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(item)}`}>
                                    {outstanding <= 0 ? "Payé" : `${formatPrice(outstanding)} restant`}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p><strong>Modèle:</strong> {item.device ? item.device.model : item.accessory?.model}</p>
                                  {item.device?.serialNumber && (
                                    <p><strong>S/N:</strong> {item.device.serialNumber}</p>
                                  )}
                                  <p><strong>Quantité:</strong> {item.quantity}</p>
                                  <p><strong>Prix unitaire:</strong> {formatPrice(item.unitPrice)}</p>
                                  <p><strong>Période:</strong> {new Date(item.startDate).toLocaleDateString('fr-FR')} - {new Date(item.endDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                                {item.notes && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                    <strong>Notes:</strong> {item.notes}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                                <p className="text-sm text-gray-500">Prix total</p>
                              </div>
                            </div>

                            {/* Enhanced Payment Schedule */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Historique des paiements
                              </h6>
                              {!Array.isArray(item.payments) || item.payments.length === 0 ? (
                                <div className="text-center py-4">
                                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  <p className="text-sm text-gray-500">Aucun paiement enregistré</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {item.payments.map((payment) => {
                                    if (!payment) return null;
                                    
                                    return (
                                      <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(payment.type)}`}>
                                              {payment.type}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('fr-FR') : 'Date non définie'}
                                            </span>
                                          </div>
                                          {payment.periodStartDate && payment.periodEndDate && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Période: {new Date(payment.periodStartDate).toLocaleDateString('fr-FR')} - {new Date(payment.periodEndDate).toLocaleDateString('fr-FR')}
                                            </p>
                                          )}
                                          {payment.notes && (
                                            <p className="text-xs text-gray-500 mt-1 italic">
                                              {payment.notes}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <span className="text-lg font-semibold text-green-600">
                                            {formatPrice(payment.amount || 0)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  
                                  {/* Payment Summary */}
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">Total payé:</span>
                                      <span className="font-medium text-green-600">{formatPrice(totalPaid)}</span>
                                    </div>
                                    {outstanding > 0 && (
                                      <div className="flex justify-between items-center text-sm mt-1">
                                        <span className="text-gray-600">Reste à payer:</span>
                                        <span className="font-medium text-red-600">{formatPrice(outstanding)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedRentals.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">Aucune location ne correspond aux filtres sélectionnés</p>
        </div>
      )}

      {/* Enhanced Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Étendre la location</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvelle date de fin
                </label>
                <input
                  type="date"
                  value={extensionDate}
                  onChange={(e) => setExtensionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes d&apos;extension (optionnel)
                </label>
                <textarea
                  value={extensionNotes}
                  onChange={(e) => setExtensionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                                     placeholder="Raison de l&apos;extension, conditions particulières..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExtensionModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleExtendRental(showExtensionModal)}
                disabled={!extensionDate || isExtending}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isExtending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extension...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                                         Confirmer l&apos;extension
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 