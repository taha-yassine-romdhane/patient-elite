"use client";

import { SALETYPE, RENTAL_ITEM_TYPE } from "@prisma/client";

type PaymentEntry = {
  method: SALETYPE;
  amount: number;
  paymentDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  // Additional fields for specific payment types
  cashTotal?: number;
  cashAcompte?: number;
  cashRest?: number;
  cashRestDate?: string;
  cnamStatus?: "ATTENTE" | "ACCORD";
  cnamFollowupDate?: string;
  traiteDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
};

type RentalItem = {
  id?: string;
  itemType: RENTAL_ITEM_TYPE;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  // Device or Accessory details
  deviceData?: {
    name: string;
    model: string;
    serialNumber: string;
  };
  accessoryData?: {
    name: string;
    model: string;
  };
  payments: PaymentEntry[];
};

type RentalGroup = {
  id: string;
  name: string;
  items: RentalItem[];
  sharedPayments: PaymentEntry[];
  startDate: string;
  endDate: string;
  notes?: string;
};

interface FinancialSummaryProps {
  rentalItems: RentalItem[];
  rentalGroups: RentalGroup[];
}

function FinancialSummary({ rentalItems, rentalGroups }: FinancialSummaryProps) {
  // Calculate total amount from all rental items and groups
  const calculateTotalAmount = (items: RentalItem[], groups: RentalGroup[] = []): number => {
    const itemsTotal = items.reduce((total, item) => total + item.totalPrice, 0);
    const groupsTotal = groups.reduce((total, group) => {
      return total + group.items.reduce((groupTotal, item) => groupTotal + item.totalPrice, 0);
    }, 0);
    return itemsTotal + groupsTotal;
  };

  // Calculate total paid from all payments
  const calculateTotalPaid = (items: RentalItem[], groups: RentalGroup[] = []): number => {
    const itemsPaid = items.reduce((total, item) => {
      return total + item.payments.reduce((sum, payment) => sum + payment.amount, 0);
    }, 0);
    const groupsPaid = groups.reduce((total, group) => {
      const itemsPaid = group.items.reduce((itemTotal, item) => {
        return itemTotal + item.payments.reduce((sum, payment) => sum + payment.amount, 0);
      }, 0);
      const sharedPaid = group.sharedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      return total + itemsPaid + sharedPaid;
    }, 0);
    return itemsPaid + groupsPaid;
  };

  // Calculate outstanding balance
  const calculateOutstandingBalance = (items: RentalItem[], groups: RentalGroup[] = []): number => {
    return calculateTotalAmount(items, groups) - calculateTotalPaid(items, groups);
  };

  // Calculate payment method breakdown
  const calculatePaymentBreakdown = (items: RentalItem[], groups: RentalGroup[] = []): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    
    // From individual items
    items.forEach(item => {
      item.payments.forEach(payment => {
        breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount;
      });
    });

    // From groups
    groups.forEach(group => {
      // Individual item payments in groups
      group.items.forEach(item => {
        item.payments.forEach(payment => {
          breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount;
        });
      });
      
      // Shared payments
      group.sharedPayments.forEach(payment => {
        breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount;
      });
    });

    return breakdown;
  };

  const totalAmount = calculateTotalAmount(rentalItems, rentalGroups);
  const totalPaid = calculateTotalPaid(rentalItems, rentalGroups);
  const outstandingBalance = calculateOutstandingBalance(rentalItems, rentalGroups);
  const paymentBreakdown = calculatePaymentBreakdown(rentalItems, rentalGroups);

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'CHEQUE':
        return 'bg-blue-100 text-blue-800';
      case 'TRAITE':
        return 'bg-purple-100 text-purple-800';
      case 'CNAM':
        return 'bg-orange-100 text-orange-800';
      case 'VIREMENT':
        return 'bg-indigo-100 text-indigo-800';
      case 'MONDAT':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Espèces';
      case 'CHEQUE':
        return 'Chèque';
      case 'TRAITE':
        return 'Traite';
      case 'CNAM':
        return 'CNAM';
      case 'VIREMENT':
        return 'Virement';
      case 'MONDAT':
        return 'Mandat';
      default:
        return method;
    }
  };

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" />
        </svg>
        Résumé financier
      </h3>
      
      {/* Main Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{totalAmount.toFixed(2)} TND</div>
          <div className="text-sm text-slate-600">Montant total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{totalPaid.toFixed(2)} TND</div>
          <div className="text-sm text-slate-600">Total payé</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <div className={`text-3xl font-bold mb-1 ${outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {outstandingBalance.toFixed(2)} TND
          </div>
          <div className="text-sm text-slate-600">Solde restant</div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-md font-semibold text-slate-700 mb-3">Répartition par méthode de paiement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getPaymentMethodColor(method)}`}>
                    {getPaymentMethodLabel(method)}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {amount.toFixed(2)} TND
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status Alert */}
      {outstandingBalance > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Il reste {outstandingBalance.toFixed(2)} TND à payer
          </p>
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h5 className="text-sm font-semibold text-slate-700 mb-2">Statistiques des éléments</h5>
          <div className="space-y-1 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Éléments individuels:</span>
              <span className="font-medium">{rentalItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Groupes:</span>
              <span className="font-medium">{rentalGroups.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Éléments dans groupes:</span>
              <span className="font-medium">{rentalGroups.reduce((sum, group) => sum + group.items.length, 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h5 className="text-sm font-semibold text-slate-700 mb-2">Pourcentage payé</h5>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression:</span>
              <span className="font-medium">{totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${outstandingBalance > 0 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialSummary; 