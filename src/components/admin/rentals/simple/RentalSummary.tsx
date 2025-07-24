"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { RentalDevice } from "./DevicesSection";
import { RentalAccessory } from "./AccessoriesSection";
import { PaymentInfo } from "./PaymentsSection";

interface RentalSummaryProps {
  devices: RentalDevice[];
  accessories: RentalAccessory[];
  payments: PaymentInfo[];
  status?: string;
  returnStatus?: string;
}

export default function RentalSummary({ devices, accessories, payments, status, returnStatus }: RentalSummaryProps) {
  // Only include payments in total that are not CNAM with 'en_attente' status
  const countablePayments = payments.filter(payment => 
    !(payment.type === 'CNAM' && payment.cnamStatus === 'en_attente')
  );
  const totalPayments = countablePayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Since devices and accessories no longer have prices, we calculate from payments
  const totalRentalPrice = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalRentalPrice - totalPayments;

  const freeAccessoriesCount = accessories.filter(a => a.isFree).length;
  const paidAccessoriesCount = accessories.filter(a => !a.isFree).length;

  const getValidationStatus = () => {
    if (devices.length === 0 && accessories.length === 0) {
      return { type: 'error', message: 'Aucun équipement ajouté' };
    }
    if (payments.length === 0) {
      return { type: 'error', message: 'Aucun paiement configuré' };
    }
    if (remainingAmount > 0) {
      return { type: 'warning', message: `Reste ${remainingAmount.toFixed(2)} TND à payer` };
    }
    if (remainingAmount < 0) {
      return { type: 'warning', message: `Trop-perçu de ${Math.abs(remainingAmount).toFixed(2)} TND` };
    }
    return { type: 'success', message: 'Location prête à être créée' };
  };

  const validationStatus = getValidationStatus();

  const getStatusBadge = (statusValue?: string) => {
    switch (statusValue) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">En attente</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Complétée</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Annulée</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Non défini</span>;
    }
  };

  const getReturnStatusBadge = (returnStatusValue?: string) => {
    switch (returnStatusValue) {
      case 'NOT_RETURNED':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Non retourné</span>;
      case 'RETURNED':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Retourné</span>;
      case 'PARTIALLY_RETURNED':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Partiellement retourné</span>;
      case 'DAMAGED':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Endommagé</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Non défini</span>;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Résumé de la location</h3>
        <div className="flex gap-2">
          {status && getStatusBadge(status)}
          {returnStatus && getReturnStatusBadge(returnStatus)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{devices.length}</p>
          <p className="text-sm text-gray-600">Appareils</p>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <p className="text-2xl font-bold text-green-600">{accessories.length}</p>
          <p className="text-sm text-gray-600">Accessoires</p>
          <div className="text-xs text-gray-500">
            {freeAccessoriesCount > 0 && (
              <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded mr-1">
                {freeAccessoriesCount} gratuit{freeAccessoriesCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{totalRentalPrice.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Location</p>
          <p className="text-xs text-purple-800 font-medium">TND</p>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <p className="text-2xl font-bold text-orange-600">{payments.length}</p>
          <p className="text-sm text-gray-600">Paiements</p>
          <p className="text-sm font-semibold text-orange-800">{totalPayments.toFixed(2)} TND</p>
        </div>
      </div>

      {/* Status indicator */}
      <div className={`p-3 rounded-lg flex items-center space-x-2 ${
        validationStatus.type === 'success' ? 'bg-green-100 text-green-800' :
        validationStatus.type === 'warning' ? 'bg-orange-100 text-orange-800' :
        'bg-red-100 text-red-800'
      }`}>
        {validationStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
        {validationStatus.type === 'warning' && <AlertCircle className="w-5 h-5" />}
        {validationStatus.type === 'error' && <XCircle className="w-5 h-5" />}
        <span className="font-medium">{validationStatus.message}</span>
      </div>

      {/* Detailed breakdown */}
      {(devices.length > 0 || accessories.length > 0 || payments.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Équipements</h4>
              <ul className="space-y-1 text-gray-600">
                {devices.map((device, index) => (
                  <li key={device.id}>
                    <span>{device.name || `Appareil ${index + 1}`}</span>
                  </li>
                ))}
                {accessories.map((accessory, index) => (
                  <li key={accessory.id} className={accessory.isFree ? 'text-green-600' : ''}>
                    <span>{accessory.name || `Accessoire ${index + 1}`}</span>
                    {accessory.isFree && <span className="text-xs ml-1">(gratuit)</span>}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Paiements</h4>
              <ul className="space-y-1 text-gray-600">
                {payments.map((payment, index) => {
                  const isEnAttente = payment.type === 'CNAM' && payment.cnamStatus === 'en_attente';
                  const isCash = payment.type === 'CASH';
                  
                  return (
                    <li key={payment.id} className={`${isEnAttente ? 'text-orange-600' : ''}`}>
                      <div className="flex justify-between">
                        <span>
                          Paiement {index + 1} ({payment.type === 'CASH' ? 'Espèces' : payment.type})
                          {isEnAttente && <span className="text-xs ml-1">(en attente)</span>}
                        </span>
                        <span>{payment.amount.toFixed(2)} TND</span>
                      </div>
                      
                      {/* Show cash payment breakdown */}
                      {isCash && payment.cashTotalPrice && payment.cashCurrentPayment !== undefined && (
                        <div className="ml-4 mt-1 text-xs space-y-0.5">
                          <div className="flex justify-between text-green-700">
                            <span>• Payé maintenant:</span>
                            <span>{payment.cashCurrentPayment.toFixed(2)} TND</span>
                          </div>
                          {payment.cashRemainingAmount && payment.cashRemainingAmount > 0 && (
                            <div className="flex justify-between text-orange-700">
                              <span>• Reste à payer:</span>
                              <span>{payment.cashRemainingAmount.toFixed(2)} TND</span>
                            </div>
                          )}
                          {payment.cashRemainingDueDate && (
                            <div className="flex justify-between text-gray-600">
                              <span>• Échéance:</span>
                              <span>{new Date(payment.cashRemainingDueDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Résumé</h4>
              <ul className="space-y-1 text-gray-600">
                <li className="flex justify-between">
                  <span>Total déclaré:</span>
                  <span>{totalRentalPrice.toFixed(2)} TND</span>
                </li>
                <li className="flex justify-between">
                  <span>Total paiements effectifs:</span>
                  <span>{totalPayments.toFixed(2)} TND</span>
                </li>
                <li className={`flex justify-between font-semibold pt-1 border-t ${
                  remainingAmount === 0 ? 'text-green-600' :
                  remainingAmount > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  <span>Solde:</span>
                  <span>{remainingAmount.toFixed(2)} TND</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}