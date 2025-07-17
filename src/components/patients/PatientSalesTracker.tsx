"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  price: number;
}

interface Accessory {
  id: string;
  name: string;
  model: string;
  quantity: number;
  price: number;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  paymentDate: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
}

interface Sale {
  id: string;
  date: string;
  amount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  devices: Device[];
  accessories: Accessory[];
  payments: Payment[];
}

interface PatientSalesTrackerProps {
  sales: Sale[];
  patientId: string;
  onSaleUpdate?: () => void;
}

export default function PatientSalesTracker({ sales }: PatientSalesTrackerProps) {
  const router = useRouter();
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate statistics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = sales.filter(sale => sale.status === "COMPLETED").length;
  const pendingSales = sales.filter(sale => sale.status === "PENDING").length;
  const totalDevices = sales.reduce((sum, sale) => sum + sale.devices.length, 0);
  const totalAccessories = sales.reduce((sum, sale) => sum + sale.accessories.length, 0);

  // Calculate payment statistics
  const totalPaid = sales.reduce((sum, sale) => 
    sum + sale.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0), 0
  );
  const outstandingAmount = totalRevenue - totalPaid;

  // Get recent sales (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = sales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);

  // Sort sales
  const sortedSales = [...sales].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "CASH":
        return "bg-green-100 text-green-800";
      case "CHEQUE":
        return "bg-blue-100 text-blue-800";
      case "CNAM":
        return "bg-teal-100 text-teal-800";
      case "TRAITE":
        return "bg-orange-100 text-orange-800";
      case "VIREMENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSortChange = (newSortBy: 'date' | 'amount') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ventes</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <p className="text-gray-500">Aucune vente enregistrée</p>
          <button
            onClick={() => router.push('/employee/sales')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Créer une vente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Ventes</h2>
        <button
          onClick={() => router.push('/employee/sales')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle vente
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Total des ventes</p>
          <p className="text-2xl font-bold text-green-700">{totalSales}</p>
          <p className="text-xs text-green-600">{recentSales.length} ce mois</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Chiffre d&apos;affaires</p>
          <p className="text-2xl font-bold text-blue-700">{totalRevenue.toFixed(2)} TND</p>
          <p className="text-xs text-blue-600">{totalPaid.toFixed(2)} TND encaissé</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Appareils vendus</p>
          <p className="text-2xl font-bold text-purple-700">{totalDevices}</p>
          <p className="text-xs text-purple-600">{totalAccessories} accessoires</p>
        </div>
        <div className={`${outstandingAmount > 0 ? 'bg-red-50' : 'bg-green-50'} p-4 rounded-lg`}>
          <p className={`text-sm ${outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            Solde restant
          </p>
          <p className={`text-2xl font-bold ${outstandingAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {outstandingAmount.toFixed(2)} TND
          </p>
          <p className={`text-xs ${outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {outstandingAmount > 0 ? 'Paiement en attente' : 'Tout encaissé'}
          </p>
        </div>
      </div>

      {/* Sales Status Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Statut des ventes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Terminées</span>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium">{completedSales}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">En attente</span>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="font-medium">{pendingSales}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Annulées</span>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="font-medium">{sales.filter(s => s.status === "CANCELLED").length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Trier par:</span>
          <button
            onClick={() => handleSortChange('date')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'date' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('amount')}
            className={`px-3 py-1 text-sm rounded ${
              sortBy === 'amount' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Montant {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        <p className="text-sm text-gray-600">{totalSales} vente(s) au total</p>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {sortedSales.map((sale) => {
          const isExpanded = expandedSale === sale.id;
          const totalPaid = sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
          const outstanding = sale.amount - totalPaid;

          return (
            <div key={sale.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        Vente #{sale.id.slice(-8)}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status === "COMPLETED" ? "Terminée" : 
                         sale.status === "PENDING" ? "En attente" : 
                         sale.status === "CANCELLED" ? "Annulée" : sale.status}
                      </span>
                      {outstanding > 0 && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          {outstanding.toFixed(2)} TND impayé
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Date:</strong> {new Date(sale.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p>
                        <strong>Montant:</strong> {sale.amount.toFixed(2)} TND
                      </p>
                      <p>
                        <strong>Éléments:</strong> {sale.devices.length} appareil(s), {sale.accessories.length} accessoire(s)
                      </p>
                      <p>
                        <strong>Paiements:</strong> {sale.payments.length} paiement(s) - {totalPaid.toFixed(2)} TND
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className={`w-5 h-5 transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 border-t space-y-6">
                  {/* Devices */}
                  {sale.devices.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Appareils vendus</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sale.devices.map((device) => (
                          <div key={device.id} className="bg-blue-50 p-3 rounded-lg">
                            <h5 className="font-medium text-blue-900">{device.name}</h5>
                            <p className="text-sm text-blue-700">Modèle: {device.model}</p>
                            <p className="text-sm text-blue-700">S/N: {device.serialNumber}</p>
                            <p className="text-sm text-blue-700 font-medium">
                              Prix: {device.price.toFixed(2)} TND
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accessories */}
                  {sale.accessories.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Accessoires vendus</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sale.accessories.map((accessory) => (
                          <div key={accessory.id} className="bg-green-50 p-3 rounded-lg">
                            <h5 className="font-medium text-green-900">{accessory.name}</h5>
                            <p className="text-sm text-green-700">Modèle: {accessory.model}</p>
                            <p className="text-sm text-green-700">Quantité: {accessory.quantity}</p>
                            <p className="text-sm text-green-700 font-medium">
                              Prix: {accessory.price.toFixed(2)} TND
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Historique des paiements</h4>
                    {sale.payments.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aucun paiement enregistré</p>
                    ) : (
                      <div className="space-y-2">
                        {sale.payments.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(payment.type)}`}>
                                {payment.type}
                              </span>
                              <div>
                                <p className="text-sm font-medium">{payment.amount.toFixed(2)} TND</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {payment.chequeNumber && (
                                <p className="text-xs text-gray-500">Chèque: {payment.chequeNumber}</p>
                              )}
                              {payment.traiteDueDate && (
                                <p className="text-xs text-gray-500">
                                  Échéance: {new Date(payment.traiteDueDate).toLocaleDateString('fr-FR')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {sale.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {sale.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 