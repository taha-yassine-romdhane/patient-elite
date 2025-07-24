"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft } from "lucide-react";
import { Patient } from "@/types/rental";

interface AppointmentFormProps {
  patient: Patient;
  onBack: () => void;
}

type AppointmentType = 'RENTAL' | 'SALE' | 'DIAGNOSTIC' | 'FOLLOW_UP' | 'MAINTENANCE' | 'CONSULTATION' | 'OTHER';

const appointmentTypeLabels: Record<AppointmentType, string> = {
  RENTAL: 'Location',
  SALE: 'Vente',
  DIAGNOSTIC: 'Diagnostic',
  FOLLOW_UP: 'Suivi patient',
  MAINTENANCE: 'Maintenance équipement',
  CONSULTATION: 'Consultation',
  OTHER: 'Autre'
};

export default function AppointmentForm({ patient, onBack }: AppointmentFormProps) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<AppointmentType | "">("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Basic validation
      if (!appointmentDate) {
        throw new Error("La date du rendez-vous est obligatoire");
      }
      if (!appointmentTime) {
        throw new Error("L'heure du rendez-vous est obligatoire");
      }
      if (!appointmentType) {
        throw new Error("Le type de rendez-vous est obligatoire");
      }

      // Combine date and time
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      
      // Check if appointment is in the future
      if (appointmentDateTime <= new Date()) {
        throw new Error("Le rendez-vous doit être planifié dans le futur");
      }

      // Prepare API data
      const appointmentData = {
        patientId: patient.id,
        appointmentDate: appointmentDateTime.toISOString(),
        type: appointmentType,
        notes: notes.trim() || undefined,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création du rendez-vous");
      }

      // Success
      alert("Rendez-vous créé avec succès!");
      onBack(); // Go back to patient selection
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient info header */}
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

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appointment Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Détails du rendez-vous</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <DatePicker
                id="appointmentDate"
                label="Date du rendez-vous *"
                value={appointmentDate}
                onChange={setAppointmentDate}
                placeholder="jj/mm/aaaa"
                required
                min={new Date().toISOString().split('T')[0]} // Minimum today
              />
            </div>
            <div>
              <Label htmlFor="appointmentTime">Heure du rendez-vous *</Label>
              <Input
                id="appointmentTime"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                min="08:00"
                max="18:00"
              />
            </div>
            <div>
              <Label htmlFor="appointmentType">Type de rendez-vous *</Label>
              <Select value={appointmentType} onValueChange={(value) => setAppointmentType(value as AppointmentType)}>
                <SelectTrigger id="appointmentType">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(appointmentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes du rendez-vous</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes concernant ce rendez-vous..."
            />
          </div>
        </Card>

        {/* Submit button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={isSubmitting || !appointmentDate || !appointmentTime || !appointmentType}
            className="px-8 py-2 text-lg"
            size="lg"
          >
            {isSubmitting ? "Création en cours..." : "Créer le rendez-vous"}
          </Button>
        </div>
      </form>
    </div>
  );
}