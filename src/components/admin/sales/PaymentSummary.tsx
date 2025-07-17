"use client";

import { SALETYPE } from "@prisma/client";

type PaymentEntry = {
  method: SALETYPE;
  amount: number;
  // Additional fields for specific payment types
  cashTotal?: number;
  cashAcompte?: number;
  cashRest?: number;
  cashRestDate?: string;
  cnamStatus?: "ATTENTE" | "ACCORD";
  cnamFollowupDate?: string;
  traiteDate?: string;
};

interface PaymentSummaryProps {
  payments: PaymentEntry[];
  onRemovePayment: (index: number) => void;
}

export default function PaymentSummary({ payments, onRemovePayment }: PaymentSummaryProps) {
  // Payment methods from SALETYPE enum
  const paymentMethods = [
    { value: "CASH", label: "Espèces" },
    { value: "CHEQUE", label: "Chèque" },
    { value: "TRAITE", label: "Traite" },
    { value: "CNAM", label: "CNAM" },
    { value: "VIREMENT", label: "Virement bancaire" },
    { value: "MONDAT", label: "Mandat" }
  ];

  // Calculate actually paid amount (excluding CNAM ATTENTE and cash rest)
  const calculatePaidAmount = (): number => {
    return payments.reduce((total, payment) => {
      if (payment.method === "CASH") {
        // For cash, only count the acompte as paid
        return total + (payment.cashAcompte || 0);
      } else if (payment.method === "CNAM" && payment.cnamStatus === "ATTENTE") {
        // CNAM ATTENTE is not yet paid
        return total;
      } else {
        // Other payments are considered paid
        return total + payment.amount;
      }
    }, 0);
  };

  // Calculate remaining balance
  const calculateRemainingBalance = (): number => {
    let remaining = 0;
    
    payments.forEach(payment => {
      if (payment.method === "CASH" && payment.cashRest) {
        // Add cash rest amount
        remaining += payment.cashRest;
      } else if (payment.method === "CNAM" && payment.cnamStatus === "ATTENTE") {
        // Add CNAM ATTENTE amount as remaining
        remaining += payment.amount;
      }
    });
    
    return remaining;
  };



  const paidAmount = calculatePaidAmount();
  const remainingBalance = calculateRemainingBalance();


  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Résumé des paiements</h3>
      {payments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-500 italic">Aucun paiement ajouté</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {paymentMethods.find(m => m.value === payment.method)?.label || payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method === "CASH" && payment.cashAcompte !== undefined ? (
                      <div>
                        <div className="text-green-600 font-medium">
                          Payé: {payment.cashAcompte.toFixed(2)} TND
                        </div>
                        {payment.cashRest && payment.cashRest > 0 && (
                          <div className="text-orange-600 font-medium">
                            Reste: {payment.cashRest.toFixed(2)} TND
                          </div>
                        )}
                      </div>
                    ) : payment.method === "CNAM" && payment.cnamStatus === "ATTENTE" ? (
                      <div className="text-orange-600 font-medium">
                        En attente: {payment.amount.toFixed(2)} TND
                      </div>
                    ) : (
                      <div className="text-green-600 font-medium">
                        {payment.amount.toFixed(2)} TND
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.method === "CASH" && payment.cashTotal && payment.cashAcompte !== undefined && (
                      <div className="text-xs">
                        <div>Total: {payment.cashTotal.toFixed(2)} TND</div>
                        <div>Acompte: {payment.cashAcompte.toFixed(2)} TND</div>
                        <div>Reste: {payment.cashRest?.toFixed(2)} TND</div>
                        {payment.cashRestDate && (
                          <div className="text-blue-600 font-medium">
                            📅 Échéance: {new Date(payment.cashRestDate).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    )}
                    {payment.method === "CNAM" && payment.cnamStatus && (
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          payment.cnamStatus === "ACCORD" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.cnamStatus}
                        </span>
                        {payment.cnamFollowupDate && (
                          <div className="text-blue-600 font-medium text-xs mt-1">
                            📅 Suivi: {new Date(payment.cnamFollowupDate).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    )}
                    {payment.method === "TRAITE" && payment.traiteDate && (
                      <div className="text-xs">
                        <div className="text-blue-600 font-medium">
                          📅 Échéance: {new Date(payment.traiteDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}
                    {!["CASH", "CNAM", "TRAITE"].includes(payment.method) && "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      onClick={() => onRemovePayment(index)}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Summary rows */}
              <tr className="bg-green-50">
                <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-green-800">
                  Total payé
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-lg font-bold text-green-700">
                  {paidAmount.toFixed(2)} TND
                </td>
                <td></td>
                <td></td>
              </tr>
              
              {remainingBalance > 0 && (
                <tr className="bg-orange-50">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-orange-800">
                    Reste à payer
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-lg font-bold text-orange-700">
                    {remainingBalance.toFixed(2)} TND
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              )}
              
             
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 