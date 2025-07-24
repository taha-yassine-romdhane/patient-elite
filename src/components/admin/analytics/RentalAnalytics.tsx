"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, PackageCheck, PackageX, TrendingUp, DollarSign, Clock, User, Calendar, AlertTriangle } from 'lucide-react';

interface PatientRental {
  id: string;
  contractNumber: string;
  patient: { id: string; fullName: string; phone: string };
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  status: string;
  returnStatus: string;
  timelineStatus: string;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  progressPercentage: number;
  amount: number;
  equipment: Array<{ type: string; name: string; model: string }>;
}

interface ActiveRental {
  id: string;
  contractNumber: string;
  patient: { fullName: string; phone: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  progressPercentage: number;
  isOverdue: boolean;
  amount: number;
  equipmentCount: number;
  equipmentSummary: string;
}

interface PatientRentalSummary {
  patient: { id: string; fullName: string; phone: string };
  totalRentals: number;
  activeRentals: number;
  totalRevenue: number;
  avgDuration: number;
}

interface RentalAnalyticsData {
  activeRentals: number;
  totalRentals: number;
  overduePayments: number;
  rentalsByStatus: Array<{ status: string; count: number }>;
  rentalRevenue: number;
  averageRentalDuration: number;
  patientRentals: PatientRental[];
  activeRentalsWithProgress: ActiveRental[];
  rentalsByPatient: PatientRentalSummary[];
}

interface RentalAnalyticsProps {
  data: RentalAnalyticsData;
}

export function RentalAnalytics({ data }: RentalAnalyticsProps) {
  const totalRentals = data.totalRentals || 0;
  const activeRentals = data.activeRentals || 0;
  const overdueRentals = data.overduePayments || 0;
  const totalRevenue = data.rentalRevenue || 0;

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      active: 'En cours',
      completed: 'Terminé',
      overdue: 'En retard',
      cancelled: 'Annulé'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.cancelled}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations actives</CardTitle>
            <PackageCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{totalRentals > 0 ? ((activeRentals / totalRentals) * 100).toFixed(1) : 0}% du total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations en retard</CardTitle>
            <PackageX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueRentals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Paiements ou retours en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des locations</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRentals.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Toutes les locations enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRentalDuration}</div>
            <p className="text-xs text-muted-foreground">jours par location</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Rentals with Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Locations en cours avec progression
          </CardTitle>
          <CardDescription>Suivi détaillé des locations actives par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activeRentalsWithProgress && data.activeRentalsWithProgress.length > 0 ? (
              data.activeRentalsWithProgress.slice(0, 10).map((rental) => (
                <div key={rental.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{rental.patient.fullName}</h4>
                      <p className="text-sm text-muted-foreground">{rental.contractNumber}</p>
                      <p className="text-xs text-muted-foreground">{rental.equipmentSummary}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{rental.amount.toFixed(2)} TND</div>
                      {rental.isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          En retard
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression: {rental.progressPercentage}%</span>
                      <span>{rental.daysElapsed}/{rental.totalDays} jours</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          rental.isOverdue ? 'bg-red-500' : 
                          rental.progressPercentage > 80 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, rental.progressPercentage)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Début: {rental.startDate}</span>
                      <span>Fin prévue: {rental.endDate}</span>
                    </div>
                    
                    {rental.daysRemaining > 0 ? (
                      <div className="text-xs text-green-600">
                        {rental.daysRemaining} jour{rental.daysRemaining > 1 ? 's' : ''} restant{rental.daysRemaining > 1 ? 's' : ''}
                      </div>
                    ) : (
                      <div className="text-xs text-red-600">
                        En retard de {Math.abs(rental.daysRemaining)} jour{Math.abs(rental.daysRemaining) > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune location active</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Rentals Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Timeline des locations par patient
          </CardTitle>
          <CardDescription>Historique des locations avec statut et progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.patientRentals && data.patientRentals.length > 0 ? (
              data.patientRentals.slice(0, 15).map((rental) => (
                <div key={rental.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getTimelineStatusColor(rental.timelineStatus)}`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-medium truncate">{rental.patient.fullName}</h4>
                        <p className="text-xs text-muted-foreground">{rental.contractNumber}</p>
                      </div>
                      {getStatusBadge(rental.timelineStatus)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rental.startDate} → {rental.endDate}
                      </span>
                      <span>{rental.totalDays} jours</span>
                      <span>{rental.amount.toFixed(2)} TND</span>
                    </div>
                    
                    {rental.timelineStatus === 'active' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Jour {rental.daysElapsed}/{rental.totalDays}</span>
                          <span>{rental.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${rental.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {rental.equipment.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Équipements: {rental.equipment.slice(0, 2).map(e => e.name).join(', ')}
                        {rental.equipment.length > 2 && ` +${rental.equipment.length - 2} autres`}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée de location disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Patients by Rentals */}
      <Card>
        <CardHeader>
          <CardTitle>Top patients par nombre de locations</CardTitle>
          <CardDescription>Classement des patients les plus actifs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.rentalsByPatient && data.rentalsByPatient.length > 0 ? (
              data.rentalsByPatient.slice(0, 10).map((patientData, index) => (
                <div key={patientData.patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{patientData.patient.fullName}</h4>
                      <p className="text-xs text-muted-foreground">{patientData.patient.phone}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{patientData.totalRentals}</div>
                        <div className="text-xs text-muted-foreground">locations</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{patientData.activeRentals}</div>
                        <div className="text-xs text-muted-foreground">actives</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{patientData.totalRevenue.toFixed(0)} TND</div>
                        <div className="text-xs text-muted-foreground">total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{patientData.avgDuration}j</div>
                        <div className="text-xs text-muted-foreground">moy.</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée patient disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
