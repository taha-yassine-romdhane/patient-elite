"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import NewCalendar from "@/components/calendar/NewCalendar";
import CalendarNotifications from "@/components/calendar/CalendarNotifications";
import { calendarService, CalendarEvent, NotificationItem } from "@/services/calendarService";

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    appointments: 0,
    rentals: 0,
    sales: 0,
    diagnostics: 0,
    overduePayments: 0
  });

  const loadCalendarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await calendarService.fetchAllData();
      const calendarEvents = calendarService.getCalendarEvents();
      const calendarNotifications = calendarService.getNotifications();
      const calendarStats = calendarService.getStats();
      
      setEvents(calendarEvents);
      setNotifications(calendarNotifications);
      setStats(calendarStats);
      
      console.log("Calendar data loaded:", {
        events: calendarEvents.length,
        notifications: calendarNotifications.length,
        stats: calendarStats
      });
      
    } catch (error) {
      console.error("Error loading calendar data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
    
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  const handleDateClick = (date: Date) => {
    console.log("Date clicked:", date);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    console.log("Notification clicked:", notification);
  };

  const handleNotificationDismiss = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleNotificationDismissAll = () => {
    setNotifications([]);
  };

  const handleRefresh = () => {
    loadCalendarData();
  };

  const handleBack = () => {
    router.push('/employee/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg text-black">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-500 rounded"></div>
                <div>
                  <div className="text-2xl font-bold text-black">{stats.appointments}</div>
                  <div className="text-sm text-gray-600">Rendez-vous</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded"></div>
                <div>
                  <div className="text-2xl font-bold text-black">{stats.rentals}</div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-500 rounded"></div>
                <div>
                  <div className="text-2xl font-bold text-black">{stats.sales}</div>
                  <div className="text-sm text-gray-600">Ventes</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-orange-500 rounded"></div>
                <div>
                  <div className="text-2xl font-bold text-black">{stats.diagnostics}</div>
                  <div className="text-sm text-gray-600">Diagnostics</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-red-500 rounded"></div>
                <div>
                  <div className="text-2xl font-bold text-black">{stats.overduePayments}</div>
                  <div className="text-sm text-gray-600">Paiements en retard</div>
                </div>
              </div>
            </Card>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <NewCalendar
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* Notifications */}
        <CalendarNotifications
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onDismiss={handleNotificationDismiss}
          onDismissAll={handleNotificationDismissAll}
        />
      </div>
    </div>
  );
} 