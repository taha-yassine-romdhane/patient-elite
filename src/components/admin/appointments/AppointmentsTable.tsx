"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, MapPin, Edit, Trash2, Search, Filter, AlertTriangle } from "lucide-react";

interface Appointment {
  id: string;
  appointmentDate: string;
  type: string;
  status: string;
  notes?: string;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    region: string;
    address: string;
  };
  rental?: {
    id: string;
    contractNumber: string;
  };
  sale?: {
    id: string;
    amount: number;
  };
  diagnostic?: {
    id: string;
    polygraph: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

const appointmentTypeLabels: Record<string, string> = {
  RENTAL: 'Location',
  SALE: 'Vente',
  DIAGNOSTIC: 'Diagnostic',
  FOLLOW_UP: 'Suivi patient',
  MAINTENANCE: 'Maintenance équipement',
  CONSULTATION: 'Consultation',
  OTHER: 'Autre'
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Planifié',
  CONFIRMED: 'Confirmé',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  NO_SHOW: 'Patient absent',
  RESCHEDULED: 'Reprogrammé'
};

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
  RESCHEDULED: 'bg-purple-100 text-purple-800'
};

export default function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    type: "",
    notes: ""
  });

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, typeFilter, fromDate, toDate]);

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des rendez-vous");
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      // Refresh the appointments list
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    setEditForm({
      appointmentDate: appointmentDate.toISOString().split('T')[0],
      appointmentTime: appointmentDate.toTimeString().slice(0, 5),
      type: appointment.type,
      notes: appointment.notes || ""
    });
    setEditingAppointment(appointment);
  };

  const handleEditSubmit = async () => {
    if (!editingAppointment) return;

    try {
      const appointmentDateTime = new Date(`${editForm.appointmentDate}T${editForm.appointmentTime}`);
      
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAppointment.id,
          appointmentDate: appointmentDateTime.toISOString(),
          type: editForm.type,
          notes: editForm.notes.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      setEditingAppointment(null);
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      const response = await fetch(`/api/appointments?id=${deleteConfirmId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setDeleteConfirmId(null);
      fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    searchTerm === "" || 
    appointment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patient.phone.includes(searchTerm) ||
    appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des rendez-vous...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, téléphone ou notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
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
            <div>
              <DatePicker
                placeholder="Date de début"
                value={fromDate}
                onChange={setFromDate}
              />
            </div>
            <div>
              <DatePicker
                placeholder="Date de fin"
                value={toDate}
                onChange={setToDate}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun rendez-vous trouvé</p>
              <p className="text-sm">Aucun rendez-vous ne correspond à vos critères de recherche</p>
            </div>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                      <Clock className="h-4 w-4 text-gray-500 ml-2" />
                      <span className="text-gray-600">{formatTime(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}>
                        {statusLabels[appointment.status] || appointment.status}
                      </Badge>
                      <Badge variant="outline">
                        {appointmentTypeLabels[appointment.type] || appointment.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{appointment.patient.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{appointment.patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{appointment.patient.region}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {appointment.notes}
                    </div>
                  )}

                  {/* Related Records */}
                  {(appointment.rental || appointment.sale || appointment.diagnostic) && (
                    <div className="text-sm text-blue-600">
                      {appointment.rental && (
                        <span>Lié à la location: {appointment.rental.contractNumber}</span>
                      )}
                      {appointment.sale && (
                        <span>Lié à une vente de {appointment.sale.amount} TND</span>
                      )}
                      {appointment.diagnostic && (
                        <span>Lié au diagnostic {appointment.diagnostic.polygraph}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Select
                    value={appointment.status}
                    onValueChange={(status) => updateAppointmentStatus(appointment.id, status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(appointment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteConfirmId(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
            <DialogDescription>
              Modifier les détails du rendez-vous
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={editForm.appointmentDate}
                onChange={(e) => setEditForm({...editForm, appointmentDate: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Heure</Label>
              <Input
                type="time"
                value={editForm.appointmentTime}
                onChange={(e) => setEditForm({...editForm, appointmentTime: e.target.value})}
              />
            </div>
            
            <div>
              <Label>Type</Label>
              <Select value={editForm.type} onValueChange={(value) => setEditForm({...editForm, type: value})}>
                <SelectTrigger>
                  <SelectValue />
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
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAppointment(null)}>
              Annuler
            </Button>
            <Button onClick={handleEditSubmit}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}