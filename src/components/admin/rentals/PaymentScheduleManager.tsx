'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, CreditCard, Building2, Receipt } from 'lucide-react';
import { SALETYPE } from '@prisma/client';
import { PaymentInfo } from './simple/PaymentsSection';

interface PaymentScheduleManagerProps {
  payment: PaymentInfo;
  onPaymentChange: (field: string, value: any) => void;
}

export default function PaymentScheduleManager({ payment, onPaymentChange }: PaymentScheduleManagerProps) {
  
  const renderCashSchedule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Nombre de versements</Label>
          <Input
            type="number"
            min="1"
            max="36"
            value={payment.cashInstallments || ''}
            onChange={(e) => onPaymentChange('cashInstallments', parseInt(e.target.value) || 0)}
            placeholder="ex: 12"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Montant par versement</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={payment.cashInstallmentAmount || ''}
            onChange={(e) => onPaymentChange('cashInstallmentAmount', parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>
        <div>
          <Label>Fréquence</Label>
          <Select 
            value={payment.cashFrequency || ''} 
            onValueChange={(value) => onPaymentChange('cashFrequency', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
              <SelectItem value="MONTHLY">Mensuel</SelectItem>
              <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Prochaine échéance</Label>
        <DatePicker
          value={payment.cashNextDueDate || ''}
          onChange={(value) => onPaymentChange('cashNextDueDate', value)}
          placeholder="JJ/MM/AAAA"
          className="text-sm"
        />
      </div>
    </div>
  );

  const renderChequeSchedule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Nombre de chèques</Label>
          <Input
            type="number"
            min="1"
            max="24"
            value={payment.chequeInstallments || ''}
            onChange={(e) => onPaymentChange('chequeInstallments', parseInt(e.target.value) || 0)}
            placeholder="ex: 6"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Fréquence</Label>
          <Select 
            value={payment.chequeFrequency || ''} 
            onValueChange={(value) => onPaymentChange('chequeFrequency', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensuel</SelectItem>
              <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
              <SelectItem value="YEARLY">Annuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>N° série de départ</Label>
          <Input
            type="text"
            value={payment.chequeSerialStart || ''}
            onChange={(e) => onPaymentChange('chequeSerialStart', e.target.value)}
            placeholder="ex: 001234"
            className="text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>N° chèque actuel</Label>
          <Input
            type="text"
            value={payment.chequeNumber || ''}
            onChange={(e) => onPaymentChange('chequeNumber', e.target.value)}
            placeholder="ex: 001234"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Prochaine échéance</Label>
          <DatePicker
            value={payment.chequeNextDueDate || ''}
            onChange={(value) => onPaymentChange('chequeNextDueDate', value)}
            placeholder="JJ/MM/AAAA"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderVirementSchedule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Fréquence</Label>
          <Select 
            value={payment.virementFrequency || ''} 
            onValueChange={(value) => onPaymentChange('virementFrequency', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensuel</SelectItem>
              <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
              <SelectItem value="YEARLY">Annuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Prochaine échéance</Label>
          <DatePicker
            value={payment.virementNextDueDate || ''}
            onChange={(value) => onPaymentChange('virementNextDueDate', value)}
            placeholder="JJ/MM/AAAA"
            className="text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Compte bancaire</Label>
          <Input
            type="text"
            value={payment.virementBankAccount || ''}
            onChange={(e) => onPaymentChange('virementBankAccount', e.target.value)}
            placeholder="ex: IBAN ou RIB"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Référence</Label>
          <Input
            type="text"
            value={payment.virementReference || ''}
            onChange={(e) => onPaymentChange('virementReference', e.target.value)}
            placeholder="ex: REF001"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderTraiteSchedule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Fréquence</Label>
          <Select 
            value={payment.traiteFrequency || ''} 
            onValueChange={(value) => onPaymentChange('traiteFrequency', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensuel</SelectItem>
              <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
              <SelectItem value="YEARLY">Annuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Prochaine échéance</Label>
          <DatePicker
            value={payment.traiteNextDueDate || ''}
            onChange={(value) => onPaymentChange('traiteNextDueDate', value)}
            placeholder="JJ/MM/AAAA"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Référence traite</Label>
          <Input
            type="text"
            value={payment.traiteReference || ''}
            onChange={(e) => onPaymentChange('traiteReference', e.target.value)}
            placeholder="ex: TR001"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderCnamSchedule = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Statut CNAM</Label>
          <Select 
            value={payment.cnamStatus || ''} 
            onValueChange={(value) => onPaymentChange('cnamStatus', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ATTENTE">En attente</SelectItem>
              <SelectItem value="ACCORD">Accordé</SelectItem>
              <SelectItem value="REFUSE">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Montant pris en charge</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={payment.cnamSupportAmount || 0}
            onChange={(e) => onPaymentChange('cnamSupportAmount', parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Date de début</Label>
          <DatePicker
            value={payment.cnamDebutDate || ''}
            onChange={(value) => onPaymentChange('cnamDebutDate', value)}
            placeholder="JJ/MM/AAAA"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Durée (mois)</Label>
          <Input
            type="number"
            min="1"
            max="120"
            value={payment.cnamSupportMonths || ''}
            onChange={(e) => onPaymentChange('cnamSupportMonths', parseInt(e.target.value) || 0)}
            placeholder="ex: 12"
            className="text-sm"
          />
        </div>
        <div>
          <Label>Date de fin</Label>
          <DatePicker
            value={payment.cnamEndDate || ''}
            onChange={(value) => onPaymentChange('cnamEndDate', value)}
            placeholder="JJ/MM/AAAA"
            className="text-sm bg-gray-50"
          />
        </div>
      </div>
      {payment.cnamFollowupDate && (
        <div>
          <Label>Date de suivi</Label>
          <DatePicker
            value={payment.cnamFollowupDate}
            onChange={(value) => onPaymentChange('cnamFollowupDate', value)}
            placeholder="JJ/MM/AAAA"
            className="text-sm"
          />
        </div>
      )}
    </div>
  );

  const getPaymentIcon = (type: SALETYPE) => {
    switch (type) {
      case SALETYPE.CASH: return <DollarSign className="w-4 h-4" />;
      case SALETYPE.CHEQUE: return <Receipt className="w-4 h-4" />;
      case SALETYPE.VIREMENT: return <Building2 className="w-4 h-4" />;
      case SALETYPE.TRAITE: return <CreditCard className="w-4 h-4" />;
      case SALETYPE.CNAM: return <Calendar className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentTypeName = (type: SALETYPE) => {
    switch (type) {
      case SALETYPE.CASH: return 'Espèces';
      case SALETYPE.CHEQUE: return 'Chèque';
      case SALETYPE.VIREMENT: return 'Virement';
      case SALETYPE.TRAITE: return 'Traite';
      case SALETYPE.CNAM: return 'CNAM';
      default: return type;
    }
  };

  const renderScheduleContent = () => {
    switch (payment.type) {
      case SALETYPE.CASH:
        return renderCashSchedule();
      case SALETYPE.CHEQUE:
        return renderChequeSchedule();
      case SALETYPE.VIREMENT:
        return renderVirementSchedule();
      case SALETYPE.TRAITE:
        return renderTraiteSchedule();
      case SALETYPE.CNAM:
        return renderCnamSchedule();
      default:
        return <p className="text-gray-500 text-sm">Aucune planification disponible pour ce type de paiement.</p>;
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center mb-4">
        {getPaymentIcon(payment.type)}
        <h4 className="text-lg font-semibold text-purple-800 ml-2">
          Planification {getPaymentTypeName(payment.type)}
        </h4>
        <Badge variant="outline" className="ml-2 text-xs">
          {payment.amount.toFixed(2)} TND
        </Badge>
      </div>
      
      {renderScheduleContent()}
    </Card>
  );
}