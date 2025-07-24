"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, MapPin, Phone, Hash, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'appointment' | 'rental' | 'sale' | 'diagnostic' | 'payment' | 'reminder';
  status: string;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  };
  details: Record<string, any>;
}

interface NewCalendarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onRefresh: () => void;
  loading: boolean;
}

const eventTypeConfig = {
  appointment: {
    label: 'Rendez-vous',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700'
  },
  rental: {
    label: 'Location',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    lightBg: 'bg-green-50',
    lightText: 'text-green-700'
  },
  rental_period: {
    label: 'Période location',
    bgColor: 'bg-green-400',
    textColor: 'text-white',
    lightBg: 'bg-green-50',
    lightText: 'text-green-700'
  },
  sale: {
    label: 'Vente',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-700'
  },
  diagnostic: {
    label: 'Diagnostic',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    lightBg: 'bg-orange-50',
    lightText: 'text-orange-700'
  },
  payment: {
    label: 'Paiement',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    lightBg: 'bg-yellow-50',
    lightText: 'text-yellow-700'
  },
  reminder: {
    label: 'Rappel',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700'
  }
};

const periodStatusConfig = {
  ongoing: { bgColor: 'bg-green-400', borderColor: 'border-green-500' },
  completed: { bgColor: 'bg-gray-400', borderColor: 'border-gray-500' },
  scheduled: { bgColor: 'bg-blue-300', borderColor: 'border-blue-400' },
  overdue: { bgColor: 'bg-red-400', borderColor: 'border-red-500' },
  active: { bgColor: 'bg-green-400', borderColor: 'border-green-500' }
};

// Status translation functions
const translateRentalStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'En attente',
    'COMPLETED': 'Terminé',
    'CANCELLED': 'Annulé',
    'ACTIVE': 'Actif',
    'ongoing': 'En cours',
    'completed': 'Terminé',
    'scheduled': 'Programmé', 
    'overdue': 'En retard',
    'active': 'Actif'
  };
  return statusMap[status] || status;
};

const translateReturnStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'NOT_RETURNED': 'Non retourné',
    'RETURNED': 'Retourné',
    'PARTIALLY_RETURNED': 'Partiellement retourné',
    'DAMAGED': 'Endommagé'
  };
  return statusMap[status] || status;
};

const translateAppointmentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'SCHEDULED': 'Programmé',
    'CONFIRMED': 'Confirmé',
    'COMPLETED': 'Terminé',
    'CANCELLED': 'Annulé',
    'NO_SHOW': 'Absent',
    'RESCHEDULED': 'Reprogrammé'
  };
  return statusMap[status] || status;
};

const translatePaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'DUE': 'À payer',
    'OVERDUE': 'En retard',
    'PAID': 'Payé',
    'PENDING': 'En attente'
  };
  return statusMap[status] || status;
};

const formatFrenchDate = (date: Date, includeTime: boolean = true): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return date.toLocaleDateString('fr-FR', options);
};

export default function NewCalendar({ events, onEventClick, onDateClick, onRefresh, loading }: NewCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayActivities, setShowDayActivities] = useState(false);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Next month's leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => event.date.toDateString() === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
    onEventClick(event);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayActivities(true);
    onDateClick(date);
  };

  const getDayActivities = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => event.date.toDateString() === dateStr);
  };

  const getRentalPeriodStyle = (event: CalendarEvent) => {
    if (event.type !== 'rental_period' || !event.details) return {};
    
    const config = periodStatusConfig[event.status as keyof typeof periodStatusConfig];
    if (!config) return {};
    
    const opacity = event.dayInPeriod === 1 || event.dayInPeriod === event.totalDays ? '100' : '80';
    
    return {
      className: `${config.bgColor} ${config.borderColor} border-l-4 opacity-${opacity}`,
      style: {
        background: event.dayInPeriod === 1 ? 
          'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 
          event.dayInPeriod === event.totalDays ? 
          'linear-gradient(90deg, #16a34a 0%, #15803d 100%)' :
          '#22c55e'
      }
    };
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Calendar Header */}
      <Card className="mb-6 bg-gray-100 text-black border border-gray-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Calendrier</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="bg-white text-black hover:bg-gray-50 border-gray-300"
              >
                {loading ? "..." : "Actualiser"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="bg-white text-black hover:bg-gray-50 border-gray-300"
              >
                Aujourd'hui
              </Button>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="text-black hover:bg-gray-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="text-black hover:bg-gray-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${config.bgColor}`}></div>
                  <span className="text-gray-600">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-0">
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 border border-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isTodayDate = isToday(day.date);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-400 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !day.isCurrentMonth ? 'bg-gray-25 text-gray-400' : 'bg-white'
                  } ${isTodayDate ? 'ring-2 ring-black' : ''}`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div className={`text-sm font-medium mb-2 ${isTodayDate ? 'text-black font-bold' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {/* Show events as circles for better UX */}
                    {(() => {
                      const rentalPeriods = dayEvents.filter(e => e.type === 'rental_period');
                      const otherEvents = dayEvents.filter(e => e.type !== 'rental_period');
                      
                      // Show rental periods as small circles
                      const rentalCircles = rentalPeriods.slice(0, 8).map((event) => {
                        const config = eventTypeConfig[event.type];
                        const periodStyle = getRentalPeriodStyle(event);
                        
                        return (
                          <div
                            key={event.id}
                            className="inline-block cursor-pointer mr-1 mb-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            title={`${event.patient?.fullName} - Jour ${event.dayInPeriod}/${event.totalDays}`}
                          >
                            <div 
                              className={`w-3 h-3 rounded-full border hover:scale-110 transition-transform ${periodStyle.className}`}
                              style={{
                                backgroundColor: event.status === 'ongoing' ? '#22c55e' : 
                                               event.status === 'completed' ? '#9ca3af' :
                                               event.status === 'overdue' ? '#ef4444' : '#60a5fa'
                              }}
                            />
                          </div>
                        );
                      });
                      
                      // Show other events as small badges
                      const otherEventBadges = otherEvents.slice(0, 3).map((event) => {
                        const config = eventTypeConfig[event.type];
                        
                        return (
                          <div
                            key={event.id}
                            className="cursor-pointer mb-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            <Badge
                              className={`${config.bgColor} ${config.textColor} text-xs px-2 py-1 truncate block hover:opacity-80 transition-opacity`}
                            >
                              {event.title}
                            </Badge>
                          </div>
                        );
                      });
                      
                      return (
                        <>
                          {/* Rental circles in a flex container */}
                          {rentalCircles.length > 0 && (
                            <div className="flex flex-wrap">
                              {rentalCircles}
                            </div>
                          )}
                          
                          {/* Other events as badges */}
                          {otherEventBadges}
                        </>
                      );
                    })()}
                    
                    {dayEvents.length > 11 && (
                      <div className="text-xs text-gray-500 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleDateClick(day.date)}>
                        +{dayEvents.length - 11} plus...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  <div className={`w-4 h-4 rounded-full ${eventTypeConfig[selectedEvent.type].bgColor}`}></div>
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatFrenchDate(selectedEvent.date)}
              </div>

              {selectedEvent.patient && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="font-medium">{selectedEvent.patient.fullName}</div>
                    <div className="text-gray-600">{selectedEvent.patient.phone}</div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Badge className={`${eventTypeConfig[selectedEvent.type].lightBg} ${eventTypeConfig[selectedEvent.type].lightText}`}>
                  {eventTypeConfig[selectedEvent.type].label}
                </Badge>
                <Badge className="ml-2 bg-gray-100 text-gray-700">
                  {selectedEvent.type === 'rental' || selectedEvent.type === 'rental_period' 
                    ? translateRentalStatus(selectedEvent.status)
                    : selectedEvent.type === 'appointment'
                    ? translateAppointmentStatus(selectedEvent.status)  
                    : selectedEvent.type === 'payment'
                    ? translatePaymentStatus(selectedEvent.status)
                    : selectedEvent.status}
                </Badge>
              </div>

              {Object.keys(selectedEvent.details).length > 0 && (
                <div className="text-sm space-y-2">
                  <div className="font-medium">Détails:</div>
                  {Object.entries(selectedEvent.details).map(([key, value]) => {
                    let displayKey = key;
                    let displayValue = String(value);
                    
                    // Translate field names
                    const fieldTranslations: Record<string, string> = {
                      'amount': 'Montant',
                      'contractNumber': 'N° Contrat',
                      'returnStatus': 'Statut retour',
                      'endDate': 'Date de fin',
                      'startDate': 'Date de début',
                      'actualReturnDate': 'Date de retour effective',
                      'totalDays': 'Durée totale (jours)',
                      'type': 'Type',
                      'notes': 'Notes',
                      'region': 'Région',
                      'paymentType': 'Type de paiement',
                      'isOverdue': 'En retard',
                      'overdueDays': 'Jours de retard',
                      'isOpenRental': 'Location ouverte'
                    };
                    
                    displayKey = fieldTranslations[key] || key;
                    
                    // Translate specific values
                    if (key === 'returnStatus') {
                      displayValue = translateReturnStatus(String(value));
                    } else if ((key === 'endDate' || key === 'startDate' || key === 'actualReturnDate') && value && value !== 'Location ouverte') {
                      // Handle date formatting - check if it's an ISO string
                      try {
                        const date = new Date(String(value));
                        if (!isNaN(date.getTime())) {
                          displayValue = date.toLocaleDateString('fr-FR');
                        }
                      } catch (e) {
                        displayValue = String(value);
                      }
                    } else if (key === 'amount') {
                      displayValue = `${value} TND`;
                    } else if (key === 'isOverdue') {
                      displayValue = value ? 'Oui' : 'Non';
                    } else if (key === 'isOpenRental') {
                      displayValue = value ? 'Oui' : 'Non';
                    }
                    
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{displayKey}:</span>
                        <span className="font-medium">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Activities Dialog */}
      <Dialog open={showDayActivities} onOpenChange={setShowDayActivities}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activités du {selectedDate ? formatFrenchDate(selectedDate, false) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4">
              {(() => {
                const dayActivities = getDayActivities(selectedDate);
                const groupedActivities = {
                  appointments: dayActivities.filter(e => e.type === 'appointment'),
                  rentals: dayActivities.filter(e => e.type === 'rental'),
                  rental_periods: dayActivities.filter(e => e.type === 'rental_period'),
                  sales: dayActivities.filter(e => e.type === 'sale'),
                  payments: dayActivities.filter(e => e.type === 'payment'),
                  diagnostics: dayActivities.filter(e => e.type === 'diagnostic'),
                  reminders: dayActivities.filter(e => e.type === 'reminder')
                };

                if (dayActivities.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune activité prévue pour cette date</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{groupedActivities.appointments.length}</div>
                        <div className="text-xs text-gray-600">Rendez-vous</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{groupedActivities.rentals.length + groupedActivities.rental_periods.length}</div>
                        <div className="text-xs text-gray-600">Locations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{groupedActivities.sales.length}</div>
                        <div className="text-xs text-gray-600">Ventes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{groupedActivities.diagnostics.length}</div>
                        <div className="text-xs text-gray-600">Diagnostics</div>
                      </div>
                    </div>

                    {/* Rental Periods - Special Section */}
                    {groupedActivities.rental_periods.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-400"></div>
                          Périodes de location ({groupedActivities.rental_periods.length})
                        </h3>
                        <div className="grid gap-3">
                          {groupedActivities.rental_periods.map((event) => (
                            <Card key={event.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`${periodStatusConfig[event.status]?.bgColor || 'bg-gray-400'} text-white text-xs`}>
                                      {translateRentalStatus(event.status)}
                                    </Badge>
                                    <span className="text-sm font-medium">{event.patient?.fullName}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Jour {event.dayInPeriod}/{event.totalDays} • {event.details?.progressPercentage || 0}% complété
                                  </div>
                                  {event.details?.contractNumber && (
                                    <div className="text-xs text-gray-500">
                                      Contrat: {event.details.contractNumber}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  {event.details?.amount && (
                                    <div className="text-sm font-medium">{event.details.amount} TND</div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    {event.startDate?.toLocaleDateString('fr-FR')} → {event.endDate?.toLocaleDateString('fr-FR')}
                                  </div>
                                </div>
                              </div>
                              {event.details?.progressPercentage !== undefined && (
                                <div className="mt-3">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                      style={{ width: `${event.details.progressPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Other Activities */}
                    {Object.entries(groupedActivities).map(([type, events]) => {
                      if (type === 'rental_periods' || events.length === 0) return null;
                      
                      const config = eventTypeConfig[type] || eventTypeConfig.reminder;
                      
                      return (
                        <div key={type}>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${config.bgColor}`}></div>
                            {config.label} ({events.length})
                          </h3>
                          <div className="grid gap-3">
                            {events.map((event) => (
                              <Card key={event.id} className="p-4 hover:bg-gray-50 cursor-pointer" 
                                    onClick={() => handleEventClick(event)}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge className={`${config.lightBg} ${config.lightText} text-xs`}>
                                        {config.label}
                                      </Badge>
                                      <Badge className="bg-gray-100 text-gray-700 text-xs">
                                        {event.type === 'rental' || event.type === 'rental_period' 
                                          ? translateRentalStatus(event.status)
                                          : event.type === 'appointment'
                                          ? translateAppointmentStatus(event.status)  
                                          : event.type === 'payment'
                                          ? translatePaymentStatus(event.status)
                                          : event.status}
                                      </Badge>
                                    </div>
                                    <div className="font-medium mb-1">{event.title}</div>
                                    {event.patient && (
                                      <div className="text-sm text-gray-600 flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        {event.patient.fullName}
                                        {event.patient.phone && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {event.patient.phone}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right text-sm">
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      {event.date.toLocaleTimeString('fr-FR', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </div>
                                    {event.details?.amount && (
                                      <div className="font-medium">{event.details.amount} TND</div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Show key details */}
                                {Object.keys(event.details).length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {Object.entries(event.details).slice(0, 4).map(([key, value]) => {
                                        let displayKey = key;
                                        let displayValue = String(value);
                                        
                                        // Translate field names
                                        const fieldTranslations: Record<string, string> = {
                                          'amount': 'Montant',
                                          'contractNumber': 'N° Contrat',
                                          'returnStatus': 'Statut retour',
                                          'endDate': 'Date de fin',
                                          'startDate': 'Date de début',
                                          'actualReturnDate': 'Date de retour effective',
                                          'totalDays': 'Durée totale (jours)',
                                          'type': 'Type',
                                          'notes': 'Notes',
                                          'region': 'Région',
                                          'paymentType': 'Type de paiement',
                                          'isOverdue': 'En retard',
                                          'overdueDays': 'Jours de retard',
                                          'isOpenRental': 'Location ouverte'
                                        };
                                        
                                        displayKey = fieldTranslations[key] || key;
                                        
                                        // Translate specific values
                                        if (key === 'returnStatus') {
                                          displayValue = translateReturnStatus(String(value));
                                        } else if ((key === 'endDate' || key === 'startDate' || key === 'actualReturnDate') && value && value !== 'Location ouverte') {
                                          // Handle date formatting - check if it's an ISO string
                                          try {
                                            const date = new Date(String(value));
                                            if (!isNaN(date.getTime())) {
                                              displayValue = date.toLocaleDateString('fr-FR');
                                            }
                                          } catch (e) {
                                            displayValue = String(value);
                                          }
                                        } else if (key === 'amount') {
                                          displayValue = `${value} TND`;
                                        } else if (key === 'isOverdue') {
                                          displayValue = value ? 'Oui' : 'Non';
                                        } else if (key === 'isOpenRental') {
                                          displayValue = value ? 'Oui' : 'Non';
                                        }
                                        
                                        return (
                                          <div key={key} className="flex justify-between">
                                            <span className="text-gray-500 truncate">{displayKey}:</span>
                                            <span className="font-medium truncate">{displayValue}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}