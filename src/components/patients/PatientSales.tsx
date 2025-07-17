"use client";

import { Sale } from "@/types/patient";
import { useState } from "react";
import { formatDate, formatCurrency, getStatusBadgeClass, getPaymentMethodDisplay } from "@/utils/formatters";

interface PatientSalesProps {
  sales: Sale[];
}

export default function PatientSales({ sales }: PatientSalesProps) {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  if (!sales || sales.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Ventes</h2>
        <p className="text-gray-500 italic">Aucune vente disponible pour ce patient.</p>
      </div>
    );
  }

  const toggleSaleDetails = (saleId: string) => {
    if (expandedSaleId === saleId) {
      setExpandedSaleId(null);
    } else {
      setExpandedSaleId(saleId);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Ventes</h2>
      <div className="space-y-4">
        {sales.map((sale) => (
          <div key={sale.id} className="border rounded-lg overflow-hidden">
            <div 
              className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSaleDetails(sale.id)}
            >
              <div>
                <p className="font-medium">Date: {formatDate(sale.date)}</p>
                <p className="text-sm text-gray-600">Montant: {formatCurrency(sale.amount)}</p>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(sale.status)}`}>
                  {sale.status === "COMPLETED" ? "Complété" : 
                   sale.status === "PENDING" ? "En attente" : "Annulé"}
                </span>
                <svg 
                  className={`w-5 h-5 ml-2 transform transition-transform ${expandedSaleId === sale.id ? "rotate-180" : ""}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedSaleId === sale.id && (
              <div className="p-4 border-t">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Détails de la vente</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Méthode de paiement:</p>
                      <p>{getPaymentMethodDisplay(sale.type)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Statut:</p>
                      <p>{sale.status}</p>
                    </div>
                  </div>
                </div>
                
                {sale.devices && sale.devices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Appareils</h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° de série</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sale.devices.map((device) => (
                          <tr key={device.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{device.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{device.model}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{device.serialNumber}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(device.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {sale.accessories && sale.accessories.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Accessoires</h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sale.accessories.map((accessory) => (
                          <tr key={accessory.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{accessory.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{accessory.model}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{accessory.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(accessory.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
