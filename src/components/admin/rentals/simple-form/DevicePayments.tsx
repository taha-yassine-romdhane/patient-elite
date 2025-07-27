"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Trash2, Bell } from "lucide-react";
import { SALETYPE } from "@prisma/client";
import { PaymentInfo, PaymentAlert } from "../simple/PaymentsSection";
import { EnhancedRentalDevice } from "./types";

interface DevicePaymentsProps {
  device: EnhancedRentalDevice;
  addPaymentToDevice: (deviceId: string) => void;
  updateDevicePayment: (deviceId: string, paymentId: string, field: keyof PaymentInfo, value: any) => void;
  removePaymentFromDevice: (deviceId: string, paymentId: string) => void;
  addAlertToPayment: (deviceId: string, paymentId: string) => void;
  updatePaymentAlert: (deviceId: string, paymentId: string, alertId: string, field: keyof PaymentAlert, value: string) => void;
  removeAlertFromPayment: (deviceId: string, paymentId: string, alertId: string) => void;
  getPaymentTypeLabel: (type: SALETYPE) => string;
  calculateCnamDuration: (debutDate: string, endDate: string) => number;
}

export function DevicePayments({
  device,
  addPaymentToDevice,
  updateDevicePayment,
  removePaymentFromDevice,
  addAlertToPayment,
  updatePaymentAlert,
  removeAlertFromPayment,
  getPaymentTypeLabel,
  calculateCnamDuration,
}: DevicePaymentsProps) {
  return (
    <div className="mb-6 bg-yellow-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <h5 className="font-medium text-yellow-700">Paiements pour cet appareil</h5>
          <div className="flex space-x-2">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
              {device.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)} TND
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addPaymentToDevice(device.id)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter paiement
        </Button>
      </div>
      
      {device.payments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucun paiement configuré pour cet appareil
        </p>
      ) : (
        <div className="space-y-4">
          {device.payments.map((payment, payIndex) => (
            <div key={payment.id} className="border border-yellow-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h6 className="font-medium flex items-center space-x-2">
                  <span>Paiement {payIndex + 1}</span>
                  <span className="text-sm text-gray-500">
                    ({getPaymentTypeLabel(payment.type)})
                  </span>
                  {payment.alerts.length > 0 && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Bell className="w-3 h-3" />
                      <span>{payment.alerts.length}</span>
                    </Badge>
                  )}
                </h6>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addAlertToPayment(device.id, payment.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Ajouter une alerte"
                  >
                    <Plus className="w-3 h-3" />
                    <Bell className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePaymentFromDevice(device.id, payment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <Label className="text-sm">Type de paiement</Label>
                  <Select
                    value={payment.type}
                    onValueChange={(value) => updateDevicePayment(device.id, payment.id, 'type', value as SALETYPE)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SALETYPE.CASH}>Espèces</SelectItem>
                      <SelectItem value={SALETYPE.CHEQUE}>Chèque</SelectItem>
                      <SelectItem value={SALETYPE.TRAITE}>Traite</SelectItem>
                      <SelectItem value={SALETYPE.VIREMENT}>Virement</SelectItem>
                      <SelectItem value={SALETYPE.MONDAT}>Mandat postal</SelectItem>
                      <SelectItem value={SALETYPE.CNAM}>CNAM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Montant (TND) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payment.amount || 0}
                    onChange={(e) => updateDevicePayment(device.id, payment.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <DatePicker
                    label="Date d'échéance"
                    value={payment.dueDate || ""}
                    onChange={(value) => updateDevicePayment(device.id, payment.id, 'dueDate', value)}
                    placeholder="JJ/MM/AAAA"
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              {/* Payment Time Zone - For all payment types except CNAM */}
              {payment.type !== SALETYPE.CNAM && (
                <div className="bg-orange-50 p-3 rounded border-t">
                  <p className="text-sm font-medium text-orange-700 mb-3">Zone temporelle couverte par ce paiement</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <DatePicker
                        label="Date début couverture"
                        value={payment.dueDate || ""}
                        onChange={(value) => updateDevicePayment(device.id, payment.id, 'dueDate', value)}
                        placeholder="JJ/MM/AAAA"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CNAM specific fields */}
              {payment.type === SALETYPE.CNAM && (
                <div className="border-t pt-3 mt-3 bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium text-blue-700 mb-3">Informations CNAM</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm">Statut CNAM</Label>
                      <Select
                        value={payment.cnamStatus || ""}
                        onValueChange={(value) => updateDevicePayment(device.id, payment.id, 'cnamStatus', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Sélectionner statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="accord">Accord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Montant pris en charge CNAM (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment.cnamSupportAmount || 0}
                        onChange={(e) => updateDevicePayment(device.id, payment.id, 'cnamSupportAmount', parseFloat(e.target.value) || 0)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-3">
                    <p className="text-sm font-medium text-blue-600 mb-3">Période de prise en charge CNAM</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <DatePicker
                          label="Date de début"
                          value={payment.cnamDebutDate || ""}
                          onChange={(value) => updateDevicePayment(device.id, payment.id, 'cnamDebutDate', value)}
                          placeholder="JJ/MM/AAAA"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Durée (mois)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          value={payment.cnamSupportMonths || ""}
                          onChange={(e) => updateDevicePayment(device.id, payment.id, 'cnamSupportMonths', parseInt(e.target.value) || 0)}
                          placeholder="ex: 12"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <DatePicker
                          label="Date de fin (calculée)"
                          value={payment.cnamEndDate || ""}
                          onChange={(value) => updateDevicePayment(device.id, payment.id, 'cnamEndDate', value)}
                          placeholder="JJ/MM/AAAA"
                          className="text-sm bg-gray-50"
                        />
                      </div>
                      <div className="flex items-end">
                        {payment.cnamDebutDate && payment.cnamEndDate && (
                          <div className="p-2 bg-blue-100 rounded text-center w-full">
                            <p className="text-lg font-bold text-blue-700">
                              {calculateCnamDuration(payment.cnamDebutDate, payment.cnamEndDate)}
                            </p>
                            <p className="text-xs text-blue-600">mois</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash payment specific fields */}
              {payment.type === SALETYPE.CASH && (
                <div className="border-t pt-3 mt-3 bg-green-50 p-3 rounded">
                  <p className="text-sm font-medium text-green-700 mb-3">Détails paiement espèces</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm">Prix total (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment.cashTotalPrice || 0}
                        onChange={(e) => updateDevicePayment(device.id, payment.id, 'cashTotalPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Prix total à payer"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Montant payé maintenant (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment.cashCurrentPayment || 0}
                        onChange={(e) => updateDevicePayment(device.id, payment.id, 'cashCurrentPayment', parseFloat(e.target.value) || 0)}
                        placeholder="Montant payé actuellement"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Montant restant (TND)</Label>
                      <Input
                        type="number"
                        value={payment.cashRemainingAmount || 0}
                        readOnly
                        className="text-sm bg-gray-100"
                        placeholder="Calculé automatiquement"
                      />
                    </div>
                    <div>
                      <DatePicker
                        label="Date d'échéance du reste"
                        value={payment.cashRemainingDueDate || ""}
                        onChange={(value) => updateDevicePayment(device.id, payment.id, 'cashRemainingDueDate', value)}
                        placeholder="JJ/MM/AAAA"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts section */}
              {payment.alerts.length > 0 && (
                <div className="border-t pt-3 mt-3 bg-red-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-red-700 flex items-center">
                      <Bell className="w-4 h-4 mr-2" />
                      Alertes ({payment.alerts.length})
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {payment.alerts.map((alert, alertIndex) => (
                      <div key={alert.id} className="border border-red-200 rounded p-2 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-red-700">
                            Alerte {alertIndex + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAlertFromPayment(device.id, payment.id, alert.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <DatePicker
                              label="Date de l'alerte"
                              value={alert.date || ""}
                              onChange={(value) => updatePaymentAlert(device.id, payment.id, alert.id, 'date', value)}
                              placeholder="JJ/MM/AAAA"
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Note</Label>
                            <Input
                              value={alert.note || ""}
                              onChange={(e) => updatePaymentAlert(device.id, payment.id, alert.id, 'note', e.target.value)}
                              placeholder="Ajoutez une note..."
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <Label className="text-sm">Notes</Label>
                <Input
                  value={payment.notes || ""}
                  onChange={(e) => updateDevicePayment(device.id, payment.id, 'notes', e.target.value)}
                  placeholder="Notes sur ce paiement..."
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
