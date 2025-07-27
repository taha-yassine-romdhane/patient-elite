"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Bell } from "lucide-react";
import { SALETYPE } from "@prisma/client";
import { EnhancedRentalDevice } from "./types";

interface GlobalRentalSummaryProps {
  devices: EnhancedRentalDevice[];
  notes: string;
  formatDate: (dateStr: string) => string;
  getPaymentTypeLabel: (type: SALETYPE) => string;
}

export function GlobalRentalSummary({ devices, notes, formatDate, getPaymentTypeLabel }: GlobalRentalSummaryProps) {
  const totalRentalPrice = devices.reduce((sum, device) => 
    sum + device.payments.reduce((pSum, p) => pSum + p.amount, 0), 0
  );

  return (
    <>
      {/* Enhanced Global Summary */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center mb-6">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-blue-800">Résumé de la location</h3>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{devices.length}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Appareils</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-green-200 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">
                  {devices.reduce((sum, device) => sum + device.accessories.length, 0)}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Accessoires</p>
            <p className="text-xs text-gray-500">
              ({devices.reduce((sum, device) => sum + device.accessories.filter(a => a.isFree).length, 0)} gratuits)
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">
                  {devices.reduce((sum, device) => sum + device.payments.length, 0)}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Paiements</p>
            <p className="text-xs text-gray-500">{totalRentalPrice.toFixed(2)} TND</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-red-200 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">
                  {devices.reduce((sum, device) => sum + device.payments.reduce((pSum, p) => pSum + (p.alerts?.length || 0), 0), 0)}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Alertes</p>
          </div>
        </div>

        {/* Devices Summary */}
        {devices.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Appareils configurés</h4>
            <div className="space-y-2">
              {devices.map((device, index) => (
                <div key={device.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">
                      {device.name || `Appareil ${index + 1}`}
                    </span>
                    {device.model && (
                      <span className="text-xs text-gray-500">
                        {device.model}
                      </span>
                    )}
                    {device.serialNumber && (
                      <span className="text-xs text-gray-400">
                        S/N: {device.serialNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Notes section */}
        {notes && (
          <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-700 mb-2">Notes générales</h5>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
        )}
      </Card>

      {/* Timeline Previews */}
      {devices.length > 0 && devices.some(device => device.startDate && device.startDate.trim() !== '') && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Timeline des locations</h3>
            <Badge variant="outline" className="text-blue-600">
              {devices.filter(device => device.startDate && device.startDate.trim() !== '').length} appareil{devices.filter(device => device.startDate && device.startDate.trim() !== '').length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Simple payments summary for each device */}
          <div className="space-y-4">
            {devices.map((device, index) => (
              device.startDate && device.startDate.trim() !== '' && device.payments.length > 0 && (
                <Card key={device.id} className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    {device.name || `Appareil ${index + 1}`}
                  </h4>
                  <div className="space-y-3">
                    {device.payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg overflow-hidden">
                        {/* Payment header */}
                        <div className="flex items-center justify-between p-4 bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-xs font-medium">
                              {getPaymentTypeLabel(payment.type)}
                            </Badge>
                            <span className="font-semibold text-lg">{payment.amount.toFixed(2)} TND</span>
                          </div>
                          {payment.alerts && payment.alerts.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-600">
                                {payment.alerts.length} alerte{payment.alerts.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Payment period */}
                        <div className="px-4 py-3 bg-white">
                          <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Période responsable:</span>
                            {payment.type === SALETYPE.CNAM ? (
                              <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                                {payment.cnamDebutDate ? formatDate(payment.cnamDebutDate) : 'N/A'} → {payment.cnamEndDate ? formatDate(payment.cnamEndDate) : 'N/A'}
                              </span>
                            ) : (
                              <span className="bg-green-100 px-2 py-1 rounded text-green-800">
                                À partir du {payment.dueDate ? formatDate(payment.dueDate) : 'Date non définie'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Alerts details */}
                        {payment.alerts && payment.alerts.length > 0 && (
                          <div className="px-4 py-3 bg-red-50 border-t">
                            <div className="space-y-2">
                              {payment.alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start space-x-2">
                                  <Bell className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-red-700">
                                        {alert.date ? formatDate(alert.date) : 'Date non définie'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-red-600 mt-1">
                                      {alert.note || 'Aucune note pour cette alerte'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )
            ))}
          </div>
          
          {/* Global Timeline Summary */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3">Résumé global de la location</h4>
            
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-lg font-bold text-blue-600">{totalRentalPrice.toFixed(2)} TND</div>
                <div className="text-sm text-gray-600">Total paiements</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-lg font-bold text-green-600">
                  {devices.length}
                </div>
                <div className="text-sm text-gray-600">Appareils loués</div>
              </div>
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-lg font-bold text-purple-600">
                  {devices.reduce((sum, device) => sum + device.payments.reduce((pSum, p) => pSum + (p.alerts?.length || 0), 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Alertes totales</div>
              </div>
            </div>

            {/* Timeline Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-lg font-bold text-indigo-600">
                  {devices.reduce((sum, device) => sum + device.payments.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Paiements totaux</div>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-lg font-bold text-purple-600">
                  {devices.reduce((earliest, device) => 
                    !earliest || device.startDate < earliest ? device.startDate : earliest, ""
                  ) && formatDate(devices.reduce((earliest, device) => 
                    !earliest || device.startDate < earliest ? device.startDate : earliest, ""
                  ))}
                </div>
                <div className="text-sm text-gray-600">Début location</div>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-lg font-bold text-orange-600">
                  {(() => {
                    const latestRenewal = devices.reduce((latest, device) => {
                      const deviceRenewal = device.payments.reduce((renewal, payment) => {
                        if (payment.type === SALETYPE.CNAM && payment.cnamEndDate) {
                          return !renewal || payment.cnamEndDate > renewal ? payment.cnamEndDate : renewal;
                        }
                        return renewal;
                      }, "");
                      return !latest || deviceRenewal > latest ? deviceRenewal : latest;
                    }, "");
                    return latestRenewal ? formatDate(latestRenewal) : 'N/A';
                  })()}
                </div>
                <div className="text-sm text-gray-600">Renouvellement</div>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-lg font-bold text-cyan-600">{devices.length}</div>
                <div className="text-sm text-gray-600">Appareils</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
