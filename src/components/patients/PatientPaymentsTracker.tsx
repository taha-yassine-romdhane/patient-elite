"use client";

import { useState } from "react";

interface DeviceItem {
  id: string;
  name: string;
}

interface AccessoryItem {
  id: string;
  name: string;
}

interface PaymentData {
  id: string;
  amount: number;
  type: string;
  paymentDate: string;
  periodStartDate?: string;
  periodEndDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
}

interface RentalItem {
  id: string;
  device?: DeviceItem;
  accessory?: AccessoryItem;
  payments?: PaymentData[];
}

interface Sale {
  id: string;
  date: string;
  amount: number;
  devices?: DeviceItem[];
  accessories?: AccessoryItem[];
  payments?: PaymentData[];
}

interface Rental {
  id: string;
  startDate: string;
  amount: number;
  rentalItems?: RentalItem[];
  payments?: PaymentData[];
}

interface Payment extends PaymentData {
  source: 'sale' | 'rental';
  sourceId: string;
  sourceDetails?: {
    type: 'sale' | 'rental';
    date: string;
    totalAmount: number;
    items: string[];
  };
}

interface PatientPaymentsTrackerProps {
  sales: Sale[];
  rentals: Rental[];
}

export default function PatientPaymentsTracker({ sales, rentals }: PatientPaymentsTrackerProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showOutstandingOnly, setShowOutstandingOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Aggregate all payments from sales and rentals
  const allPayments: Payment[] = [];
  
  // Add payments from sales
  sales.forEach(sale => {
    sale.payments?.forEach((payment: PaymentData) => {
      allPayments.push({
        ...payment,
        source: 'sale',
        sourceId: sale.id,
        sourceDetails: {
          type: 'sale',
          date: sale.date,
          totalAmount: sale.amount,
          items: [
            ...sale.devices?.map((d: DeviceItem) => d.name) || [],
            ...sale.accessories?.map((a: AccessoryItem) => a.name) || []
          ]
        }
      });
    });
  });

  // Add payments from rentals
  rentals.forEach(rental => {
    rental.payments?.forEach((payment: PaymentData) => {
      allPayments.push({
        ...payment,
        source: 'rental',
        sourceId: rental.id,
        sourceDetails: {
          type: 'rental',
          date: rental.startDate,
          totalAmount: rental.amount,
          items: rental.rentalItems?.map((item: RentalItem) => 
            item.device?.name || item.accessory?.name || ''
          ).filter(Boolean) || []
        }
      });
    });
    
    // Add payments from rental items
    rental.rentalItems?.forEach((item: RentalItem) => {
      item.payments?.forEach((payment: PaymentData) => {
        allPayments.push({
          ...payment,
          source: 'rental',
          sourceId: rental.id,
          sourceDetails: {
            type: 'rental',
            date: rental.startDate,
            totalAmount: rental.amount,
            items: [(item.device?.name || item.accessory?.name || '')]
          }
        });
      });
    });
  });

  // Calculate outstanding amounts
  const outstandingAmounts = new Map<string, number>();
  
  // Calculate outstanding for sales
  sales.forEach(sale => {
    const totalPaid = sale.payments?.reduce((sum: number, payment: PaymentData) => sum + payment.amount, 0) || 0;
    const outstanding = sale.amount - totalPaid;
    if (outstanding > 0) {
      outstandingAmounts.set(`sale-${sale.id}`, outstanding);
    }
  });

  // Calculate outstanding for rentals
  rentals.forEach(rental => {
    const totalPaid = rental.rentalItems?.reduce((total: number, item: RentalItem) => {
      const itemPaid = item.payments?.reduce((sum: number, payment: PaymentData) => sum + payment.amount, 0) || 0;
      return total + itemPaid;
    }, 0) || 0;
    const outstanding = rental.amount - totalPaid;
    if (outstanding > 0) {
      outstandingAmounts.set(`rental-${rental.id}`, outstanding);
    }
  });

  // Filter payments
  const filteredPayments = allPayments.filter(payment => {
    if (selectedPaymentType !== 'all' && payment.type !== selectedPaymentType) return false;
    if (selectedSource !== 'all' && payment.source !== selectedSource) return false;
    if (showOutstandingOnly) {
      const key = `${payment.source}-${payment.sourceId}`;
      return outstandingAmounts.has(key);
    }
    return true;
  });

  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  // Calculate statistics
  const totalPayments = allPayments.length;
  const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutstanding = Array.from(outstandingAmounts.values()).reduce((sum, amount) => sum + amount, 0);
  const totalRevenue = totalPaid + totalOutstanding;

  // Payment method statistics
  const paymentMethodStats = allPayments.reduce((acc, payment) => {
    acc[payment.type] = (acc[payment.type] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get unique payment types for filter
  const paymentTypes = [...new Set(allPayments.map(p => p.type))];

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

  const getSourceColor = (source: string) => {
    return source === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (totalPayments === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Paiements</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-500">Aucun paiement enregistré</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Paiements</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total: {totalPayments} paiements</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total paiements</p>
          <p className="text-2xl font-bold text-blue-700">{totalPayments}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Montant encaissé</p>
          <p className="text-2xl font-bold text-green-700">{totalPaid.toFixed(2)} TND</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Chiffre d&apos;affaires</p>
          <p className="text-2xl font-bold text-yellow-700">{totalRevenue.toFixed(2)} TND</p>
        </div>
        <div className={`${totalOutstanding > 0 ? 'bg-red-50' : 'bg-green-50'} p-4 rounded-lg`}>
          <p className={`text-sm ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
            Solde restant
          </p>
          <p className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {totalOutstanding.toFixed(2)} TND
          </p>
        </div>
      </div>

      {/* Payment Methods Statistics */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Répartition par méthode de paiement</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(paymentMethodStats).map(([method, amount]) => (
            <div key={method} className="text-center">
              <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(method)}`}>
                {method}
              </span>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {(amount as number).toFixed(2)} TND
              </p>
              <p className="text-xs text-gray-500">
                {((amount as number) / totalPaid * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Méthode:</label>
          <select
            value={selectedPaymentType}
            onChange={(e) => setSelectedPaymentType(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">Toutes</option>
            {paymentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Source:</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">Toutes</option>
            <option value="sale">Ventes</option>
            <option value="rental">Locations</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Trier par:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="px-3 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="date">Date</option>
            <option value="amount">Montant</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showOutstandingOnly}
            onChange={(e) => setShowOutstandingOnly(e.target.checked)}
            className="form-checkbox text-blue-600"
          />
          <span className="text-sm text-gray-600">Impayés seulement</span>
        </label>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {sortedPayments.map((payment) => {
          const outstandingKey = `${payment.source}-${payment.sourceId}`;
          const hasOutstanding = outstandingAmounts.has(outstandingKey);
          
          return (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(payment.type)}`}>
                      {payment.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(payment.source)}`}>
                      {payment.source === 'sale' ? 'Vente' : 'Location'}
                    </span>
                    {hasOutstanding && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        {outstandingAmounts.get(outstandingKey)?.toFixed(2)} TND restant
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Date de paiement:</strong> {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </p>
                      {payment.periodStartDate && payment.periodEndDate && (
                        <p className="text-sm text-gray-600">
                          <strong>Période couverte:</strong> {new Date(payment.periodStartDate).toLocaleDateString('fr-FR')} - {new Date(payment.periodEndDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {payment.chequeNumber && (
                        <p className="text-sm text-gray-600">
                          <strong>Chèque:</strong> {payment.chequeNumber}
                        </p>
                      )}
                      {payment.traiteDueDate && (
                        <p className="text-sm text-gray-600">
                          <strong>Échéance:</strong> {new Date(payment.traiteDueDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">
                        <strong>Source:</strong> {payment.source === 'sale' ? 'Vente' : 'Location'} du {new Date(payment.sourceDetails?.date || '').toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Montant total:</strong> {payment.sourceDetails?.totalAmount.toFixed(2)} TND
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Éléments:</strong> {payment.sourceDetails?.items.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Notes:</strong> {payment.notes}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{payment.amount.toFixed(2)} TND</p>
                  <p className="text-sm text-gray-500">
                    {payment.source === 'sale' ? 'Vente' : 'Location'} #{payment.sourceId.slice(-8)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedPayments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun paiement ne correspond aux filtres sélectionnés</p>
        </div>
      )}

      {/* Outstanding Amounts Summary */}
      {totalOutstanding > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 mb-3">Montants impayés</h3>
          <div className="space-y-2">
            {Array.from(outstandingAmounts.entries()).map(([key, amount]) => {
              const [type, id] = key.split('-');
              const source = type === 'sale' ? 
                sales.find(s => s.id === id) : 
                rentals.find(r => r.id === id);
              
              // Get the appropriate date based on the source type
              const sourceDate = type === 'sale' 
                ? (source as Sale)?.date 
                : (source as Rental)?.startDate;
              
              return (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-red-700">
                    {type === 'sale' ? 'Vente' : 'Location'} #{id.slice(-8)} - {sourceDate ? new Date(sourceDate).toLocaleDateString('fr-FR') : ''}
                  </span>
                  <span className="font-medium text-red-800">{amount.toFixed(2)} TND</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 