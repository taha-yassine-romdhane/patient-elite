"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Trash2, AlertCircle, Bell, Calendar } from "lucide-react";
import { SALETYPE } from "@prisma/client";

export interface PaymentAlert {
  id: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface PaymentInfo {
  id: string;
  type: SALETYPE;
  amount: number;
  dueDate: string;
  cnamStatus?: string;
  cnamSupportAmount?: number;
  cnamDebutDate?: string; // Start date of CNAM support
  cnamEndDate?: string; // End date of CNAM support (calculated or manual)
  cnamSupportMonths?: number; // Duration in months
  // Enhanced cash payment fields
  cashTotalPrice?: number;
  cashCurrentPayment?: number;
  cashRemainingAmount?: number;
  cashRemainingDueDate?: string;
  alerts: PaymentAlert[];
  notes: string;
}

interface PaymentsSectionProps {
  payments: PaymentInfo[];
  totalRentalPrice: number;
  onPaymentsChange: (payments: PaymentInfo[]) => void;
}

export default function PaymentsSection({ payments, totalRentalPrice, onPaymentsChange }: PaymentsSectionProps) {
  const addPayment = () => {
    const newPayment: PaymentInfo = {
      id: Date.now().toString(),
      type: SALETYPE.CASH,
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      alerts: [],
      notes: ""
    };
    onPaymentsChange([...payments, newPayment]);
  };

  const updatePayment = (id: string, field: keyof PaymentInfo, value: string | number) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === id) {
        const updated = { ...payment, [field]: value };
        
        // Auto-fill prix total when switching to cash payment or when amount changes
        if (field === 'type' && value === SALETYPE.CASH) {
          updated.cashTotalPrice = payment.amount;
          updated.cashCurrentPayment = 0;
          updated.cashRemainingAmount = payment.amount;
        } else if (payment.type === SALETYPE.CASH && field === 'amount') {
          updated.cashTotalPrice = value as number;
          updated.cashRemainingAmount = Math.max(0, (value as number) - (updated.cashCurrentPayment || 0));
        }
        
        // Auto-calculate for CNAM fields
        if (payment.type === SALETYPE.CNAM) {
          if (field === 'cnamDebutDate' || field === 'cnamSupportMonths') {
            // Update end date when debut date or months change
            const debutDate = field === 'cnamDebutDate' ? value as string : updated.cnamDebutDate;
            const months = field === 'cnamSupportMonths' ? value as number : updated.cnamSupportMonths;
            
            if (debutDate && months) {
              updated.cnamEndDate = calculateEndDate(debutDate, months);
            }
          } else if (field === 'cnamEndDate') {
            // Update months when end date changes
            const debutDate = updated.cnamDebutDate;
            const endDate = value as string;
            
            if (debutDate && endDate) {
              updated.cnamSupportMonths = calculateCnamDuration(debutDate, endDate);
            }
          }
        }
        
        // Auto-calculate for Cash payments
        if (payment.type === SALETYPE.CASH) {
          if (field === 'cashTotalPrice' || field === 'cashCurrentPayment') {
            const totalPrice = field === 'cashTotalPrice' ? value as number : updated.cashTotalPrice || 0;
            const currentPayment = field === 'cashCurrentPayment' ? value as number : updated.cashCurrentPayment || 0;
            
            updated.cashRemainingAmount = Math.max(0, totalPrice - currentPayment);
          }
        }
        
        return updated;
      }
      return payment;
    });
    onPaymentsChange(updatedPayments);
  };

  const addAlert = (paymentId: string) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === paymentId) {
        const newAlert: PaymentAlert = {
          id: Date.now().toString(),
          date: new Date().toISOString().split("T")[0],
          note: "",
          createdAt: new Date().toISOString()
        };
        return {
          ...payment,
          alerts: [...payment.alerts, newAlert]
        };
      }
      return payment;
    });
    onPaymentsChange(updatedPayments);
  };

  const updateAlert = (paymentId: string, alertId: string, field: keyof PaymentAlert, value: string) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === paymentId) {
        const updatedAlerts = payment.alerts.map(alert => 
          alert.id === alertId ? { ...alert, [field]: value } : alert
        );
        return { ...payment, alerts: updatedAlerts };
      }
      return payment;
    });
    onPaymentsChange(updatedPayments);
  };

  const removeAlert = (paymentId: string, alertId: string) => {
    const updatedPayments = payments.map(payment => {
      if (payment.id === paymentId) {
        const updatedAlerts = payment.alerts.filter(alert => alert.id !== alertId);
        return { ...payment, alerts: updatedAlerts };
      }
      return payment;
    });
    onPaymentsChange(updatedPayments);
  };

  const removePayment = (id: string) => {
    const updatedPayments = payments.filter(p => p.id !== id);
    onPaymentsChange(updatedPayments);
  };

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalRentalPrice - totalPayments;

  // Calculate CNAM support duration in months
  const calculateCnamDuration = (debutDate: string, endDate: string): number => {
    if (!debutDate || !endDate) return 0;
    
    const debut = new Date(debutDate);
    const end = new Date(endDate);
    
    // Calculate the difference in days and convert to months
    const timeDiff = end.getTime() - debut.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    const monthsApprox = Math.round(daysDiff / 30.44); // Average days per month
    
    return monthsApprox;
  };

  // Calculate end date based on debut date and months
  const calculateEndDate = (debutDate: string, months: number): string => {
    if (!debutDate || !months) return '';
    
    const date = new Date(debutDate);
    date.setMonth(date.getMonth() + months);
    date.setDate(date.getDate() - 1); // End the day before the next period starts
    
    return date.toISOString().slice(0, 10); // Format as YYYY-MM-DD
  };

  const getPaymentTypeLabel = (type: SALETYPE) => {
    switch (type) {
      case SALETYPE.CASH: return 'Espèces';
      case SALETYPE.CHEQUE: return 'Chèque';
      case SALETYPE.TRAITE: return 'Traite';
      case SALETYPE.VIREMENT: return 'Virement';
      case SALETYPE.MONDAT: return 'Mandat postal';
      case SALETYPE.CNAM: return 'CNAM';
      default: return type;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Paiements</h3>
          <div className="flex space-x-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {totalPayments.toFixed(2)} TND
            </span>
            {remainingAmount > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Reste: {remainingAmount.toFixed(2)} TND
              </span>
            )}
            {remainingAmount < 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                Trop-perçu: {Math.abs(remainingAmount).toFixed(2)} TND
              </span>
            )}
          </div>
        </div>
        <Button type="button" onClick={addPayment} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un paiement
        </Button>
      </div>

      {/* Payment summary */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total location</p>
            <p className="text-lg font-bold text-gray-900">{totalRentalPrice.toFixed(2)} TND</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total paiements</p>
            <p className="text-lg font-bold text-blue-600">{totalPayments.toFixed(2)} TND</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reste à payer</p>
            <p className={`text-lg font-bold ${remainingAmount > 0 ? 'text-orange-600' : remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {remainingAmount.toFixed(2)} TND
            </p>
          </div>
        </div>
      </div>
      
      {payments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Aucun paiement configuré
        </p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <div key={payment.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <span>Paiement {index + 1}</span>
                  <span className="text-sm text-gray-500">
                    ({getPaymentTypeLabel(payment.type)})
                  </span>
                  {payment.alerts.length > 0 && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Bell className="w-3 h-3" />
                      <span>{payment.alerts.length}</span>
                    </Badge>
                  )}
                </h4>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addAlert(payment.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Ajouter une alerte"
                  >
                    <Plus className="w-4 h-4" />
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(payment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <Label>Type de paiement</Label>
                  <Select
                    value={payment.type}
                    onValueChange={(value) => updatePayment(payment.id, 'type', value as SALETYPE)}
                  >
                    <SelectTrigger>
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
                  <Label>Montant (TND) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                {payment.type === SALETYPE.CASH && (
                  <div>
                    <Label>Date d'échéance</Label>
                    <DatePicker
                      value={payment.dueDate}
                      onChange={(value) => updatePayment(payment.id, 'dueDate', value)}
                      placeholder="JJ/MM/AAAA"
                      required
                    />
                  </div>
                )}
              </div>
              
              {/* CNAM specific fields */}
              {payment.type === SALETYPE.CNAM && (
                <div className="border-t pt-3 mt-3 bg-blue-50 p-3 rounded">
                  <p className="text-sm font-medium text-blue-700 mb-3">Informations CNAM</p>
                  
                  {/* First row: Status and Support Amount */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label>Statut CNAM</Label>
                      <Select
                        value={payment.cnamStatus || ""}
                        onValueChange={(value) => updatePayment(payment.id, 'cnamStatus', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="accord">Accord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Montant pris en charge CNAM (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment.cnamSupportAmount || 0}
                        onChange={(e) => updatePayment(payment.id, 'cnamSupportAmount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Second row: CNAM Support Period */}
                  <div className="border-t border-blue-200 pt-3">
                    <p className="text-sm font-medium text-blue-600 mb-3">Période de prise en charge CNAM</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label>Date de début</Label>
                        <DatePicker
                          value={payment.cnamDebutDate || ""}
                          onChange={(value) => updatePayment(payment.id, 'cnamDebutDate', value)}
                          placeholder="JJ/MM/AAAA"
                        />
                      </div>
                      <div>
                        <Label>Durée (mois)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          value={payment.cnamSupportMonths || ""}
                          onChange={(e) => updatePayment(payment.id, 'cnamSupportMonths', parseInt(e.target.value) || 0)}
                          placeholder="ex: 12"
                        />
                      </div>
                      <div>
                        <Label>Date de fin (calculée)</Label>
                        <DatePicker
                          value={payment.cnamEndDate || ""}
                          onChange={(value) => updatePayment(payment.id, 'cnamEndDate', value)}
                          placeholder="JJ/MM/AAAA"
                          className="bg-gray-50"
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
                      <Label>Prix total (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment.cashTotalPrice || 0}
                        onChange={(e) => updatePayment(payment.id, 'cashTotalPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Prix total à payer"
                      />
                    </div>
                    <div>
                      <Label>Montant payé maintenant (TND)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payment.cashCurrentPayment || 0}
                        onChange={(e) => updatePayment(payment.id, 'cashCurrentPayment', parseFloat(e.target.value) || 0)}
                        placeholder="Montant payé actuellement"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Montant restant (TND)</Label>
                      <Input
                        type="number"
                        value={payment.cashRemainingAmount || 0}
                        readOnly
                        className="bg-gray-100"
                        placeholder="Calculé automatiquement"
                      />
                    </div>
                    <div>
                      <Label>Date d'échéance du reste</Label>
                      <DatePicker
                        value={payment.cashRemainingDueDate || ""}
                        onChange={(value) => updatePayment(payment.id, 'cashRemainingDueDate', value)}
                        placeholder="JJ/MM/AAAA"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts section */}
              {payment.alerts.length > 0 && (
                <div className="border-t pt-3 mt-3 bg-yellow-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-yellow-700 flex items-center">
                      <Bell className="w-4 h-4 mr-2" />
                      Alertes ({payment.alerts.length})
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {payment.alerts.map((alert, alertIndex) => (
                      <div key={alert.id} className="border border-yellow-200 rounded p-3 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-yellow-700">
                            Alerte {alertIndex + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAlert(payment.id, alert.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Date de l'alerte</Label>
                            <DatePicker
                              value={alert.date}
                              onChange={(value) => updateAlert(payment.id, alert.id, 'date', value)}
                              placeholder="JJ/MM/AAAA"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Note</Label>
                            <Input
                              value={alert.note}
                              onChange={(e) => updateAlert(payment.id, alert.id, 'note', e.target.value)}
                              placeholder="Ajoutez une note..."
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-3">
                <Label>Notes</Label>
                <Input
                  value={payment.notes}
                  onChange={(e) => updatePayment(payment.id, 'notes', e.target.value)}
                  placeholder="Notes sur ce paiement..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}