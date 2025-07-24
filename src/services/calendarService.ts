import { fetchWithAuth } from "@/lib/apiClient";

// Base interfaces
interface Patient {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address: string;
  doctorName?: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  type: string;
  status: string;
  notes?: string;
  patient: Patient;
  rental?: { id: string; contractNumber: string; };
  sale?: { id: string; amount: number; };
  diagnostic?: { id: number; polygraph: string; };
}

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  returnStatus: string;
  contractNumber?: string;
  actualReturnDate?: string;
  patient: Patient;
  payments?: Payment[];
}

interface Sale {
  id: string;
  date: string;
  amount: number;
  status: string;
  notes?: string;
  patient: Patient;
  payments?: Payment[];
}

interface Diagnostic {
  id: number;
  date: string;
  polygraph: string;
  iahResult: number;
  idResult: number;
  remarks?: string;
  patient: Patient;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  paymentDate?: string;
  dueDate?: string;
  overdueDate?: string;
  isOverdue: boolean;
  overdueDays: number;
}

// Calendar event interface
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'rental' | 'sale' | 'diagnostic' | 'payment' | 'reminder' | 'rental_period';
  status: string;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  };
  details: Record<string, any>;
  // For rental periods
  startDate?: Date;
  endDate?: Date;
  isOngoing?: boolean;
  dayInPeriod?: number;
  totalDays?: number;
  rentalId?: string;
}

// Notification interface
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'due_soon' | 'reminder' | 'urgent';
  date: Date;
  entityType: 'appointment' | 'rental' | 'sale' | 'diagnostic' | 'payment';
  entityId: string;
  patientName?: string;
}

class CalendarService {
  private appointments: Appointment[] = [];
  private rentals: Rental[] = [];
  private sales: Sale[] = [];
  private diagnostics: Diagnostic[] = [];

  async fetchAllData(): Promise<void> {
    try {
      const [appointmentsRes, rentalsRes, salesRes, diagnosticsRes] = await Promise.all([
        fetchWithAuth("/api/appointments"),
        fetchWithAuth("/api/rentals"),
        fetchWithAuth("/api/sales"),
        fetchWithAuth("/api/diagnostics")
      ]);

      if (!appointmentsRes.ok || !rentalsRes.ok || !salesRes.ok || !diagnosticsRes.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const [appointmentsData, rentalsData, salesData, diagnosticsData] = await Promise.all([
        appointmentsRes.json(),
        rentalsRes.json(),
        salesRes.json(),
        diagnosticsRes.json()
      ]);

      this.appointments = appointmentsData;
      this.rentals = rentalsData;
      this.sales = salesData;
      this.diagnostics = diagnosticsData;

    } catch (error) {
      console.error("Error fetching calendar data:", error);
      throw error;
    }
  }

  getCalendarEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    // Transform appointments
    this.appointments.forEach(appointment => {
      events.push({
        id: `appointment-${appointment.id}`,
        title: `RDV: ${appointment.patient.fullName}`,
        date: new Date(appointment.appointmentDate),
        type: 'appointment',
        status: appointment.status,
        patient: {
          id: appointment.patient.id,
          fullName: appointment.patient.fullName,
          phone: appointment.patient.phone
        },
        details: {
          type: appointment.type,
          notes: appointment.notes,
          region: appointment.patient.region,
          linkedRental: appointment.rental?.contractNumber,
          linkedSale: appointment.sale?.amount,
          linkedDiagnostic: appointment.diagnostic?.polygraph
        }
      });
    });

    // Transform rentals with period visualization
    this.rentals.forEach(rental => {
      const startDate = new Date(rental.startDate);
      const endDate = rental.endDate ? new Date(rental.endDate) : null;
      const now = new Date();
      
      // For open rentals (no endDate), show period up to today + 30 days
      const effectiveEndDate = endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Calculate total days
      const totalDays = Math.ceil((effectiveEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Create events for each day of the rental period
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Determine if this rental is still ongoing
        const isOngoing = rental.returnStatus === 'NOT_RETURNED' && currentDate <= now;
        const isCompleted = rental.returnStatus === 'RETURNED' || currentDate < now;
        const isFuture = currentDate > now && rental.returnStatus === 'NOT_RETURNED';
        
        let periodStatus = 'active';
        if (isCompleted && rental.returnStatus === 'RETURNED') {
          periodStatus = 'completed';
        } else if (isOngoing) {
          periodStatus = 'ongoing';
        } else if (isFuture) {
          periodStatus = 'scheduled';
        } else if (currentDate < now && rental.returnStatus === 'NOT_RETURNED') {
          periodStatus = 'overdue';
        }
        
        let title = '';
        if (i === 0) {
          title = `🏁 ${rental.patient.fullName} (Début)`;
        } else if (i === totalDays - 1) {
          title = `🏁 ${rental.patient.fullName} (Fin)`;
        } else {
          title = `📅 ${rental.patient.fullName}`;
        }
        
        events.push({
          id: `rental-period-${rental.id}-day-${i}`,
          title: title,
          date: currentDate,
          type: 'rental_period',
          status: periodStatus,
          patient: {
            id: rental.patient.id,
            fullName: rental.patient.fullName,
            phone: rental.patient.phone
          },
          startDate: startDate,
          endDate: effectiveEndDate,
          isOngoing: isOngoing,
          dayInPeriod: i + 1,
          totalDays: totalDays,
          rentalId: rental.id,
          details: {
            amount: rental.amount,
            contractNumber: rental.contractNumber,
            returnStatus: rental.returnStatus,
            dayInPeriod: i + 1,
            totalDays: totalDays,
            progressPercentage: Math.round(((i + 1) / totalDays) * 100),
            actualReturnDate: rental.actualReturnDate,
            isOpenRental: !endDate // Flag to indicate if this is an open rental
          }
        });
      }
      
      // Also add discrete start and end events for clarity
      events.push({
        id: `rental-start-${rental.id}`,
        title: `🚀 Début: ${rental.patient.fullName}`,
        date: startDate,
        type: 'rental',
        status: rental.status,
        patient: {
          id: rental.patient.id,
          fullName: rental.patient.fullName,
          phone: rental.patient.phone
        },
        details: {
          amount: rental.amount,
          contractNumber: rental.contractNumber,
          returnStatus: rental.returnStatus,
          endDate: rental.endDate || 'Location ouverte',
          totalDays: totalDays,
          isOpenRental: !endDate
        }
      });

      // Only create end event if rental has a defined end date
      if (endDate) {
        events.push({
          id: `rental-end-${rental.id}`,
          title: `🔚 Fin: ${rental.patient.fullName}`,
          date: endDate,
          type: 'rental',
          status: rental.returnStatus,
          patient: {
            id: rental.patient.id,
            fullName: rental.patient.fullName,
            phone: rental.patient.phone
          },
          details: {
            amount: rental.amount,
            contractNumber: rental.contractNumber,
            actualReturnDate: rental.actualReturnDate,
            startDate: rental.startDate,
            totalDays: totalDays
          }
        });
      }

      // Payment due dates
      rental.payments?.forEach(payment => {
        if (payment.dueDate) {
          events.push({
            id: `payment-${payment.id}`,
            title: `Paiement dû: ${rental.patient.fullName}`,
            date: new Date(payment.dueDate),
            type: 'payment',
            status: payment.isOverdue ? 'OVERDUE' : 'DUE',
            patient: {
              id: rental.patient.id,
              fullName: rental.patient.fullName,
              phone: rental.patient.phone
            },
            details: {
              amount: payment.amount,
              paymentType: payment.type,
              isOverdue: payment.isOverdue,
              overdueDays: payment.overdueDays,
              contractNumber: rental.contractNumber
            }
          });
        }
      });
    });

    // Transform sales
    this.sales.forEach(sale => {
      events.push({
        id: `sale-${sale.id}`,
        title: `Vente: ${sale.patient.fullName}`,
        date: new Date(sale.date),
        type: 'sale',
        status: sale.status,
        patient: {
          id: sale.patient.id,
          fullName: sale.patient.fullName,
          phone: sale.patient.phone
        },
        details: {
          amount: sale.amount,
          notes: sale.notes
        }
      });

      // Sale payment due dates
      sale.payments?.forEach(payment => {
        if (payment.dueDate) {
          events.push({
            id: `sale-payment-${payment.id}`,
            title: `Paiement vente: ${sale.patient.fullName}`,
            date: new Date(payment.dueDate),
            type: 'payment',
            status: payment.isOverdue ? 'OVERDUE' : 'DUE',
            patient: {
              id: sale.patient.id,
              fullName: sale.patient.fullName,
              phone: sale.patient.phone
            },
            details: {
              amount: payment.amount,
              paymentType: payment.type,
              isOverdue: payment.isOverdue,
              overdueDays: payment.overdueDays,
              saleAmount: sale.amount
            }
          });
        }
      });
    });

    // Transform diagnostics
    this.diagnostics.forEach(diagnostic => {
      events.push({
        id: `diagnostic-${diagnostic.id}`,
        title: `Diagnostic: ${diagnostic.patient.fullName}`,
        date: new Date(diagnostic.date),
        type: 'diagnostic',
        status: 'COMPLETED',
        patient: {
          id: diagnostic.patient.id,
          fullName: diagnostic.patient.fullName,
          phone: diagnostic.patient.phone
        },
        details: {
          polygraph: diagnostic.polygraph,
          iahResult: diagnostic.iahResult,
          idResult: diagnostic.idResult,
          remarks: diagnostic.remarks
        }
      });
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getNotifications(): NotificationItem[] {
    const notifications: NotificationItem[] = [];
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Check overdue appointments
    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      if (appointmentDate < today && appointment.status === 'SCHEDULED') {
        notifications.push({
          id: `overdue-appointment-${appointment.id}`,
          title: 'Rendez-vous manqué',
          message: `Rendez-vous prévu avec ${appointment.patient.fullName}`,
          type: 'overdue',
          date: appointmentDate,
          entityType: 'appointment',
          entityId: appointment.id,
          patientName: appointment.patient.fullName
        });
      }
    });

    // Check upcoming appointments
    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      if (appointmentDate >= today && appointmentDate <= tomorrow && appointment.status === 'SCHEDULED') {
        notifications.push({
          id: `upcoming-appointment-${appointment.id}`,
          title: 'Rendez-vous imminent',
          message: `Rendez-vous avec ${appointment.patient.fullName} dans moins de 24h`,
          type: 'due_soon',
          date: appointmentDate,
          entityType: 'appointment',
          entityId: appointment.id,
          patientName: appointment.patient.fullName
        });
      }
    });

    // Check overdue payments
    this.rentals.forEach(rental => {
      rental.payments?.forEach(payment => {
        if (payment.isOverdue && payment.overdueDays > 0) {
          notifications.push({
            id: `overdue-payment-${payment.id}`,
            title: 'Paiement en retard',
            message: `Paiement en retard de ${payment.overdueDays} jours pour ${rental.patient.fullName}`,
            type: 'overdue',
            date: new Date(payment.dueDate!),
            entityType: 'payment',
            entityId: payment.id,
            patientName: rental.patient.fullName
          });
        }
      });
    });

    // Check upcoming rental ends (only for rentals with defined end dates)
    this.rentals.forEach(rental => {
      if (rental.endDate) {
        const endDate = new Date(rental.endDate);
        if (endDate >= today && endDate <= nextWeek && rental.returnStatus === 'NOT_RETURNED') {
          notifications.push({
            id: `rental-ending-${rental.id}`,
            title: 'Fin de location proche',
            message: `Location de ${rental.patient.fullName} se termine dans moins d'une semaine`,
            type: 'reminder',
            date: endDate,
            entityType: 'rental',
            entityId: rental.id,
            patientName: rental.patient.fullName
          });
        }
      }
    });

    return notifications.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getStats() {
    return {
      appointments: this.appointments.length,
      rentals: this.rentals.length,
      sales: this.sales.length,
      diagnostics: this.diagnostics.length,
      overduePayments: this.rentals.reduce((count, rental) => 
        count + (rental.payments?.filter(p => p.isOverdue).length || 0), 0
      ) + this.sales.reduce((count, sale) => 
        count + (sale.payments?.filter(p => p.isOverdue).length || 0), 0
      )
    };
  }
}

export const calendarService = new CalendarService();