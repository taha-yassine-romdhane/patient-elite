export type TaskType = "DIAGNOSTIC_FOLLOWUP" | "PAYMENT_REMINDER" | "CNAM_FOLLOWUP" | "CUSTOM" | "MANUAL";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface PaymentData {
  id: string;
  amount: number;
  type: string;
  dueDate?: string | Date;
  overdueDate?: string | Date;
  isOverdue?: boolean;
  overdueDays?: number;
  reminderSent?: boolean;
  // CNAM specific fields
  cnamStatus?: string;
  cnamFollowupDate?: string | Date;
  // Cash payment specific fields
  cashRest?: number;
  cashRestDate?: string | Date;
}

interface DiagnosticData {
  id: string;
  date: string;
  iahResult: number;
  patient?: {
    fullName: string;
  };
  patientId: string;
}

interface SaleData {
  id: string;
  patient: {
    fullName: string;
  };
  payments: PaymentData[];
}

export type Task = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  date: string;
  dueDate: string;
  completed: boolean;
  patientId?: string;
  patientName?: string;
  relatedData?: unknown;
  createdAt: string;
  notifications: {
    enabled: boolean;
    reminderDate?: string;
    reminderSent?: boolean;
  };
};

export const calculateIAHSeverity = (iahResult: number): "negative" | "modéré" | "sévère" => {
  if (iahResult < 15) return "negative";
  if (iahResult < 30) return "modéré";
  return "sévère";
};

export const createDiagnosticTask = (diagnostic: DiagnosticData): Task | null => {
  const severity = calculateIAHSeverity(diagnostic.iahResult);
  
  // Only create tasks for severe cases
  if (severity !== "sévère") return null;
  
  const followUpDate = new Date(diagnostic.date);
  followUpDate.setDate(followUpDate.getDate() + 7); // One week after diagnosis
  
  return {
    id: `diag-${diagnostic.id}`,
    title: `Suivi diagnostic sévère`,
    description: `Suivi requis pour ${diagnostic.patient?.fullName} - IAH: ${diagnostic.iahResult} (${severity})`,
    type: "DIAGNOSTIC_FOLLOWUP",
    priority: "HIGH",
    date: followUpDate.toISOString().split('T')[0],
    dueDate: followUpDate.toISOString().split('T')[0],
    completed: false,
    patientId: diagnostic.patientId,
    patientName: diagnostic.patient?.fullName,
    relatedData: { 
      diagnosticId: diagnostic.id, 
      iahResult: diagnostic.iahResult,
      severity 
    },
    createdAt: new Date().toISOString(),
    notifications: {
      enabled: true,
      reminderDate: new Date(followUpDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 day before
    }
  };
};

export const createCashRestTask = (payment: PaymentData, patientName: string, saleId: string): Task | null => {
  if (!payment.cashRestDate || !payment.cashRest || payment.cashRest <= 0) return null;
  
  const cashRestDate = typeof payment.cashRestDate === 'string' ? payment.cashRestDate : payment.cashRestDate.toISOString().split('T')[0];
  
  return {
    id: `cash-rest-${saleId}-${Date.now()}`,
    title: `Rappel paiement reste`,
    description: `Reste à payer: ${payment.cashRest.toFixed(2)} TND pour ${patientName}`,
    type: "PAYMENT_REMINDER",
    priority: "MEDIUM",
    date: cashRestDate,
    dueDate: cashRestDate,
    completed: false,
    patientName,
    relatedData: { 
      saleId,
      amount: payment.cashRest,
      paymentType: "CASH_REST"
    },
    createdAt: new Date().toISOString(),
    notifications: {
      enabled: true,
      reminderDate: new Date(new Date(cashRestDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };
};

export const createCnamFollowupTask = (payment: PaymentData, patientName: string, saleId: string): Task | null => {
  if (!payment.cnamFollowupDate || payment.cnamStatus !== "ATTENTE") return null;
  
  const followupDate = typeof payment.cnamFollowupDate === 'string' ? payment.cnamFollowupDate : payment.cnamFollowupDate.toISOString().split('T')[0];
  
  return {
    id: `cnam-followup-${saleId}-${Date.now()}`,
    title: `Suivi CNAM en attente`,
    description: `Vérifier le statut CNAM pour ${patientName} - Montant: ${payment.amount.toFixed(2)} TND`,
    type: "CNAM_FOLLOWUP",
    priority: "HIGH",
    date: followupDate,
    dueDate: followupDate,
    completed: false,
    patientName,
    relatedData: { 
      saleId,
      amount: payment.amount,
      paymentType: "CNAM_FOLLOWUP"
    },
    createdAt: new Date().toISOString(),
    notifications: {
      enabled: true,
      reminderDate: new Date(new Date(followupDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };
};

export const createPaymentReminderTask = (payment: PaymentData, patientName: string, rentalId: string): Task | null => {
  const today = new Date();
  const dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
  const overdueDate = payment.overdueDate ? new Date(payment.overdueDate) : null;
  
  if (!dueDate) return null;
  
  // Create reminder task if payment is due soon (within 3 days) or overdue
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = overdueDate && today > overdueDate;
  const overdueDays = isOverdue ? Math.floor((today.getTime() - overdueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  if (daysUntilDue <= 3 || isOverdue) {
    const taskId = `payment-reminder-${payment.id}`;
    
    let title = '';
    let priority: TaskPriority = 'MEDIUM';
    let description = '';
    
    if (isOverdue) {
      title = `Paiement en retard (${overdueDays} jour${overdueDays > 1 ? 's' : ''})`;
      priority = overdueDays > 7 ? 'URGENT' : 'HIGH';
      description = `Paiement en retard de ${overdueDays} jour${overdueDays > 1 ? 's' : ''} pour ${patientName} - Montant: ${payment.amount.toFixed(2)} TND`;
    } else {
      title = `Paiement bientôt dû (${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''})`;
      priority = daysUntilDue <= 1 ? 'HIGH' : 'MEDIUM';
      description = `Paiement dû dans ${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''} pour ${patientName} - Montant: ${payment.amount.toFixed(2)} TND`;
    }
    
    return {
      id: taskId,
      title,
      description,
      type: "PAYMENT_REMINDER",
      priority,
      date: isOverdue ? today.toISOString().split('T')[0] : dueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      completed: false,
      patientName,
      relatedData: { 
        rentalId,
        paymentId: payment.id,
        amount: payment.amount,
        paymentType: payment.type,
        isOverdue,
        overdueDays,
        daysUntilDue
      },
      createdAt: new Date().toISOString(),
      notifications: {
        enabled: true,
        reminderDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  }
  
  return null;
};

export const createOverduePaymentTask = (payment: PaymentData, patientName: string, rentalId: string): Task | null => {
  const today = new Date();
  const overdueDate = payment.overdueDate ? new Date(payment.overdueDate) : null;
  
  if (!overdueDate || today <= overdueDate) return null;
  
  const overdueDays = Math.floor((today.getTime() - overdueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    id: `overdue-payment-${payment.id}`,
    title: `Paiement en retard - ${overdueDays} jour${overdueDays > 1 ? 's' : ''}`,
    description: `Paiement en retard de ${overdueDays} jour${overdueDays > 1 ? 's' : ''} pour ${patientName} - Montant: ${payment.amount.toFixed(2)} TND`,
    type: "PAYMENT_REMINDER",
    priority: overdueDays > 7 ? 'URGENT' : 'HIGH',
    date: today.toISOString().split('T')[0],
    dueDate: overdueDate.toISOString().split('T')[0],
    completed: false,
    patientName,
    relatedData: { 
      rentalId,
      paymentId: payment.id,
      amount: payment.amount,
      paymentType: payment.type,
      isOverdue: true,
      overdueDays
    },
    createdAt: new Date().toISOString(),
    notifications: {
      enabled: true,
      reminderDate: today.toISOString().split('T')[0]
    }
  };
};

export const createTasksFromSale = (sale: SaleData): Task[] => {
  const tasks: Task[] = [];
  
  if (sale.payments && sale.patient) {
    sale.payments.forEach((payment: PaymentData) => {
      // Create task for cash rest payment
      const cashRestTask = createCashRestTask(payment, sale.patient.fullName, sale.id);
      if (cashRestTask) tasks.push(cashRestTask);
      
      // Create task for CNAM follow-up
      const cnamTask = createCnamFollowupTask(payment, sale.patient.fullName, sale.id);
      if (cnamTask) tasks.push(cnamTask);
    });
  }
  
  return tasks;
};

export const saveTasksToLocalStorage = (tasks: Task[]) => {
  try {
    const existingTasks = JSON.parse(localStorage.getItem("calendarTasks") || "[]");
    const allTasks = [...existingTasks, ...tasks];
    localStorage.setItem("calendarTasks", JSON.stringify(allTasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error);
  }
};

export const getTasksFromLocalStorage = (): Task[] => {
  try {
    return JSON.parse(localStorage.getItem("calendarTasks") || "[]");
  } catch (error) {
    console.error("Error loading tasks from localStorage:", error);
    return [];
  }
};

export const getUpcomingTasks = (tasks: Task[], days: number = 3): Task[] => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  return tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= today && taskDate <= futureDate && !task.completed;
  });
};

export const getTasksByPriority = (tasks: Task[], priority: TaskPriority): Task[] => {
  return tasks.filter(task => task.priority === priority && !task.completed);
};

export const getTasksByType = (tasks: Task[], type: TaskType): Task[] => {
  return tasks.filter(task => task.type === type);
}; 