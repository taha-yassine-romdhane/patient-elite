"use client";

import { Rental } from "@/types/patient";
import { useState } from "react";
import { formatDate, formatCurrency, getStatusBadgeClass, getPaymentMethodDisplay } from "@/utils/formatters";

interface PatientRentalsProps {
  rentals: Rental[];
}

export default function PatientRentals({ rentals }: PatientRentalsProps) {
  const [expandedRentalId, setExpandedRentalId] = useState<string | null>(null);

  if (!rentals || rentals.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Locations</h2>
        <p className="text-gray-500 italic">Aucune location disponible pour ce patient.</p>
      </div>
    );
  }

  const toggleRentalDetails = (rentalId: string) => {
    if (expandedRentalId === rentalId) {
      setExpandedRentalId(null);
    } else {
      setExpandedRentalId(rentalId);
    }
  };

  const getReturnStatusLabel = (status: string) => {
    switch (status) {
      case "RETURNED": return "Retourné";
      case "NOT_RETURNED": return "Non retourné";
      case "PARTIALLY_RETURNED": return "Partiellement retourné";
      case "DAMAGED": return "Endommagé";
      default: return status;
    }
  };

  // Using the utility function from formatters.ts instead
  const getReturnStatusColor = getStatusBadgeClass;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">Locations</h2>
      <div className="space-y-4">
        {rentals.map((rental) => (
          <div key={rental.id} className="border rounded-lg overflow-hidden">
            <div 
              className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleRentalDetails(rental.id)}
            >
              <div>
                <p className="font-medium">
                  Du {formatDate(rental.startDate)} au {formatDate(rental.endDate)}
                </p>
                <p className="text-sm text-gray-600">Montant: {formatCurrency(rental.amount)}</p>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${getReturnStatusColor(rental.returnStatus)}`}>
                  {getReturnStatusLabel(rental.returnStatus)}
                </span>
                <svg 
                  className={`w-5 h-5 ml-2 transform transition-transform ${expandedRentalId === rental.id ? "rotate-180" : ""}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedRentalId === rental.id && (
              <div className="p-4 border-t">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Détails de la location</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Méthode de paiement:</p>
                      <p>{getPaymentMethodDisplay(rental.type)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Statut de paiement:</p>
                      <p>{rental.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Statut de retour:</p>
                      <p>{getReturnStatusLabel(rental.returnStatus)}</p>
                    </div>
                    {rental.actualReturnDate && (
                      <div>
                        <p className="text-gray-600">Date de retour effective:</p>
                        <p>{formatDate(rental.actualReturnDate)}</p>
                      </div>
                    )}
                    {rental.notes && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Notes:</p>
                        <p>{rental.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {rental.devices && rental.devices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Appareils</h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° de série</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/jour</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rental.devices.map((device) => (
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
                
                {rental.accessories && rental.accessories.length > 0 && (
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
                        {rental.accessories.map((accessory) => (
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
