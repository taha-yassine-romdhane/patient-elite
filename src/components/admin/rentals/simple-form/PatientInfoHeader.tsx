"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Patient } from "@/types/rental";

interface PatientInfoHeaderProps {
  patient: Patient;
  onBack: () => void;
}

export function PatientInfoHeader({ patient, onBack }: PatientInfoHeaderProps) {
  return (
    <Card className="p-4 bg-blue-50">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">{patient.fullName}</h3>
          <p className="text-sm text-gray-600">{patient.phone} • {patient.address}</p>
        </div>
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Changer de patient
        </Button>
      </div>
    </Card>
  );
}
