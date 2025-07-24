"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, X, AlertCircle, Clock, Calendar } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'due_soon' | 'reminder' | 'urgent';
  date: Date;
  entityType: 'appointment' | 'rental' | 'sale' | 'diagnostic' | 'payment';
  entityId: string;
  patientName?: string;
}

interface CalendarNotificationsProps {
  notifications: NotificationItem[];
  onNotificationClick: (notification: NotificationItem) => void;
  onDismiss: (notificationId: string) => void;
  onDismissAll: () => void;
}

const notificationTypeConfig = {
  overdue: {
    icon: AlertCircle,
    bgColor: 'bg-red-500',
    lightBg: 'bg-red-50',
    textColor: 'text-red-700',
    label: 'En retard'
  },
  due_soon: {
    icon: Clock,
    bgColor: 'bg-yellow-500',
    lightBg: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    label: 'Bientôt dû'
  },
  reminder: {
    icon: Bell,
    bgColor: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    label: 'Rappel'
  },
  urgent: {
    icon: AlertCircle,
    bgColor: 'bg-red-600',
    lightBg: 'bg-red-100',
    textColor: 'text-red-800',
    label: 'Urgent'
  }
};

export default function CalendarNotifications({ 
  notifications, 
  onNotificationClick, 
  onDismiss, 
  onDismissAll 
}: CalendarNotificationsProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || notifications.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 z-50 bg-white shadow-lg"
      >
        <Bell className="h-4 w-4 mr-2" />
        Notifications ({notifications.length})
      </Button>
    );
  }

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 max-h-96 overflow-hidden bg-white shadow-xl border-0">
      <div className="bg-black text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Notifications ({notifications.length})</h3>
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissAll}
              className="text-white hover:bg-gray-800 h-8 px-2"
            >
              Tout effacer
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-gray-800 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => {
          const config = notificationTypeConfig[notification.type];
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onNotificationClick(notification)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${config.lightBg}`}>
                    <Icon className={`h-4 w-4 ${config.textColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-black truncate">
                        {notification.title}
                      </h4>
                      <Badge className={`${config.bgColor} text-white text-xs`}>
                        {config.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {notification.date.toLocaleDateString('fr-FR')}
                      </div>
                      {notification.patientName && (
                        <span className="truncate">
                          {notification.patientName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Aucune notification</p>
        </div>
      )}
    </Card>
  );
}