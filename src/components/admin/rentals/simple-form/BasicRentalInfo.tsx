"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicRentalInfoProps {
  contractNumber: string;
  setContractNumber: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export function BasicRentalInfo({
  contractNumber,
  setContractNumber,
  notes,
  setNotes,
}: BasicRentalInfoProps) {
  const generateContractNumber = () => {
    const randomNum1 = Math.floor(Math.random() * 9000) + 1000;
    const randomNum2 = Math.floor(Math.random() * 9000) + 1000;
    setContractNumber(`LOC-${randomNum1}-${randomNum2}`);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contractNumber">Numéro de contrat *</Label>
          <div className="flex gap-2">
            <Input
              id="contractNumber"
              value={contractNumber || ""}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder="ex: LOC-1234-5678"
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateContractNumber}
              className="px-3"
            >
              Générer
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes générales</Label>
          <Input
            id="notes"
            value={notes || ""}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes générales de la location..."
          />
        </div>
      </div>
    </Card>
  );
}
