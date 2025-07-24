"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle } from "lucide-react";

interface BasicRentalInfoProps {
  startDate: string;
  endDate: string;
  contractNumber: string;
  notes: string;
  status: string;
  returnStatus: string;
  actualReturnDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onContractNumberChange: (number: string) => void;
  onNotesChange: (notes: string) => void;
  onStatusChange: (status: string) => void;
  onReturnStatusChange: (status: string) => void;
  onActualReturnDateChange: (date: string) => void;
}

export default function BasicRentalInfo({
  startDate,
  endDate,
  contractNumber,
  notes,
  status,
  returnStatus,
  actualReturnDate,
  onStartDateChange,
  onEndDateChange,
  onContractNumberChange,
  onNotesChange,
  onStatusChange,
  onReturnStatusChange,
  onActualReturnDateChange
}: BasicRentalInfoProps) {
  // Generate contract number
  const generateContractNumber = () => {
    const randomNum1 = Math.floor(Math.random() * 9000) + 1000; // 4 digits
    const randomNum2 = Math.floor(Math.random() * 9000) + 1000; // 4 digits
    const contractNumber = `LOC-${randomNum1}-${randomNum2}`;
    onContractNumberChange(contractNumber);
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!startDate || !endDate || endDate.trim() === '') return { days: 0, months: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { days: 0, months: 0 };
    
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.round(days / 30 * 10) / 10; // Round to 1 decimal
    
    return { days: Math.max(0, days), months: Math.max(0, months) };
  };

  const duration = calculateDuration();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <DatePicker
            id="startDate"
            label="Date de début"
            value={startDate}
            onChange={onStartDateChange}
            placeholder="jj/mm/aaaa"
            required
          />
        </div>
        <div>
          <DatePicker
            id="endDate"
            label="Date fin prévue (optionnel)"
            value={endDate}
            onChange={onEndDateChange}
            placeholder="jj/mm/aaaa"
          />
        </div>
        <div>
          <Label htmlFor="contractNumber">Numéro de contrat *</Label>
          <div className="flex gap-2">
            <Input
              id="contractNumber"
              value={contractNumber}
              onChange={(e) => onContractNumberChange(e.target.value)}
              placeholder="ex: LOC-1234-5678"
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={generateContractNumber}
              className="px-3 flex items-center gap-2"
              title="Générer un numéro de contrat"
            >
              <Shuffle className="h-4 w-4" />
              Générer
            </Button>
          </div>
        </div>
      </div>

      {/* Status Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label>Statut de la location *</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="COMPLETED">Complétée</SelectItem>
              <SelectItem value="CANCELLED">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Statut de retour</Label>
          <Select value={returnStatus} onValueChange={onReturnStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le statut de retour" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT_RETURNED">Non retourné</SelectItem>
              <SelectItem value="RETURNED">Retourné</SelectItem>
              <SelectItem value="PARTIALLY_RETURNED">Partiellement retourné</SelectItem>
              <SelectItem value="DAMAGED">Endommagé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <DatePicker
            id="actualReturnDate"
            label="Date de retour réelle"
            value={actualReturnDate}
            onChange={onActualReturnDateChange}
            placeholder="jj/mm/aaaa"
            disabled={returnStatus === 'NOT_RETURNED'}
          />
        </div>
      </div>

      {/* Duration display */}
      {startDate && endDate && endDate.trim() !== '' && duration.days > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{duration.days}</p>
              <p className="text-sm text-blue-700">jours</p>
            </div>
            <div className="text-blue-300">≈</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{duration.months}</p>
              <p className="text-sm text-blue-700">mois</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <Label htmlFor="notes">Notes générales</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          placeholder="Notes concernant cette location..."
        />
      </div>
    </Card>
  );
}