"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/apiClient";

// Format date function
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

type Device = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  dailyRate?: number;
  monthlyRate?: number;
};

type Accessory = {
  id: string;
  name: string;
  model: string;
  quantity?: number;
  dailyRate?: number;
  monthlyRate?: number;
};

type Payment = {
  id: string;
  amount: number;
  type: "CASH" | "CHEQUE" | "TRAITE" | "CNAM" | "VIREMENT" | "MONDAT";
  paymentDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  cnamStatus?: string;
  dueDate?: string; // Added for overdue tracking
  overdueDays?: number; // Added for overdue tracking
  overdueDate?: string; // Added for overdue tracking
  isOverdue?: boolean; // Added for overdue tracking
};

type RentalItem = {
  id: string;
  itemType: "DEVICE" | "ACCESSORY";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  device?: Device;
  accessory?: Accessory;
  payments: Payment[];
};

type Technician = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type RentalGroup = {
  id: string;
  name: string;
  description?: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  rentalItems?: RentalItem[];
  sharedPayments?: Payment[];
};

type Rental = {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  returnStatus: "RETURNED" | "NOT_RETURNED" | "PARTIALLY_RETURNED" | "DAMAGED";
  notes?: string;
  actualReturnDate?: string;
  patient: {
    id: string;
    fullName: string;
    phone?: string;
    region?: string;
    address?: string;
    doctorName?: string;
    technician?: Technician;
    supervisor?: Technician;
  };
  devices?: Device[];
  accessories?: Accessory[];
  payments?: Payment[];
  rentalItems?: RentalItem[];
  rentalGroups?: RentalGroup[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
};

type DeviceWithPaymentStatus = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  paymentType: string;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'ENDING_SOON' | 'CRITICAL';
  paymentEndDate?: string;
  reminderDate?: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  lastPaymentDate?: string;
  rentalEndDate: string;
  rentalDuration: number;
  overdueDays?: number; // Added for enhanced overdue tracking
};

export default function RentalsTable() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [returnStatusFilter, setReturnStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [reminderMonthFilter, setReminderMonthFilter] = useState<string>("all");
  const [paymentEndMonthFilter, setPaymentEndMonthFilter] = useState<string>("all");
  const [rentalEndMonthFilter, setRentalEndMonthFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchRentals = async () => {
      setIsLoading(true);
      try {
        const response = await fetchWithAuth("/api/rentals");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des locations");
        }
        const data = await response.json();
        setRentals(data);
        setFilteredRentals(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  // Calculate payment status for devices with enhanced overdue tracking
  const calculatePaymentStatus = useCallback((rental: Rental, device: Device | RentalItem): DeviceWithPaymentStatus => {
    const today = new Date();
    const rentalEndDate = new Date(rental.endDate);
    const rentalDuration = Math.ceil((rentalEndDate.getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24));
    
    let payments: Payment[] = [];
    let totalAmount = 0;
    let deviceName = '';
    let deviceModel = '';
    let deviceSerial = '';
    
    if ('device' in device && device.device) {
      // RentalItem with device
      payments = device.payments || [];
      totalAmount = device.totalPrice;
      deviceName = device.device.name;
      deviceModel = device.device.model;
      deviceSerial = device.device.serialNumber;
    } else if ('name' in device) {
      // Direct device
      payments = rental.payments || [];
      totalAmount = rental.amount;
      deviceName = device.name;
      deviceModel = device.model;
      deviceSerial = device.serialNumber;
    }
    
    const paidAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const outstandingAmount = totalAmount - paidAmount;
    
    // Get last payment date
    const lastPaymentDate = payments.length > 0 
      ? payments.reduce((latest, payment) => {
          const paymentDate = new Date(payment.paymentDate || payment.periodEndDate || '');
          return paymentDate > latest ? paymentDate : latest;
        }, new Date(0))
      : null;
    
    // Enhanced overdue calculation using new payment fields
    let paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'ENDING_SOON' | 'CRITICAL' = 'PENDING';
    let overdueDays = 0;
    let paymentEndDate = rentalEndDate;
    let reminderDate = new Date(rentalEndDate);
    
    // Check for overdue payments using new payment tracking fields
    const overduePayments = payments.filter(payment => {
      if (payment.isOverdue) {
        overdueDays = Math.max(overdueDays, payment.overdueDays || 0);
        return true;
      }
      return false;
    });
    
    // Find the most critical payment status
    if (outstandingAmount <= 0) {
      paymentStatus = 'PAID';
    } else if (overduePayments.length > 0) {
      paymentStatus = 'OVERDUE';
      // Use the overdue date from the payment if available
      const mostOverduePayment = overduePayments.reduce((most, payment) => 
        (payment.overdueDays || 0) > (most.overdueDays || 0) ? payment : most
      );
      if (mostOverduePayment.overdueDate) {
        paymentEndDate = new Date(mostOverduePayment.overdueDate);
      }
    } else {
      // Check for upcoming due dates
      const upcomingPayments = payments.filter(payment => {
        if (payment.dueDate) {
          const dueDate = new Date(payment.dueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= 7 && daysUntilDue >= 0;
        }
        return false;
      });
      
      if (upcomingPayments.length > 0) {
        const nextDuePayment = upcomingPayments.reduce((earliest, payment) => {
          const dueDate = new Date(payment.dueDate!);
          const earliestDue = new Date(earliest.dueDate!);
          return dueDate < earliestDue ? payment : earliest;
        });
        
        paymentEndDate = new Date(nextDuePayment.dueDate!);
        const daysUntilDue = Math.ceil((paymentEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 1) {
          paymentStatus = 'CRITICAL';
        } else if (daysUntilDue <= 3) {
          paymentStatus = 'ENDING_SOON';
        } else {
          paymentStatus = 'PENDING';
        }
      } else {
        // Fallback to old logic for payments without new tracking
        const oldPaymentEndDate = payments.length > 0
          ? payments.reduce((latest, payment) => {
              const endDate = new Date(payment.periodEndDate || payment.paymentDate || '');
              return endDate > latest ? endDate : latest;
            }, new Date(0))
          : rentalEndDate;
        
        paymentEndDate = oldPaymentEndDate;
        
        if (today > paymentEndDate) {
          paymentStatus = 'OVERDUE';
          overdueDays = Math.floor((today.getTime() - paymentEndDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          const daysUntilEnd = Math.ceil((paymentEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntilEnd <= 1) {
            paymentStatus = 'CRITICAL';
          } else if (daysUntilEnd <= 3) {
            paymentStatus = 'ENDING_SOON';
          }
        }
      }
    }
    
    // Calculate reminder date
    const reminderDays = rentalDuration <= 30 ? 5 : 7;
    reminderDate = new Date(paymentEndDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);
    
    // Get main payment type
    const mainPaymentType = payments.length > 0 ? payments[0].type : 'PENDING';
    
    return {
      id: 'device' in device ? device.id : device.id,
      name: deviceName,
      model: deviceModel,
      serialNumber: deviceSerial,
      paymentType: mainPaymentType,
      paymentStatus,
      paymentEndDate: paymentEndDate.toISOString(),
      reminderDate: reminderDate.toISOString(),
      totalAmount,
      paidAmount,
      outstandingAmount,
      lastPaymentDate: lastPaymentDate?.toISOString(),
      rentalEndDate: rental.endDate,
      rentalDuration,
      overdueDays // Add overdue days to the return object
    };
  }, []);

  // Get only active devices with payment status (not returned)
  const getDevicesWithPaymentStatus = useCallback((rental: Rental): DeviceWithPaymentStatus[] => {
    // Only show devices that are currently being rented (not returned)
    if (rental.returnStatus === 'RETURNED') {
      return [];
    }
    
    const devices: DeviceWithPaymentStatus[] = [];
    const processedDeviceIds = new Set<string>(); // Track processed devices to avoid duplicates
    
    // First, handle devices from rental groups
    if (rental.rentalGroups && rental.rentalGroups.length > 0) {
      rental.rentalGroups.forEach(group => {
        if (group.rentalItems) {
          group.rentalItems.forEach(item => {
            if (item.device && !processedDeviceIds.has(item.device.id)) {
              devices.push(calculatePaymentStatus(rental, item));
              processedDeviceIds.add(item.device.id);
            }
          });
        }
      });
    }
    
    // Then, handle individual rental items (not in groups)
    if (rental.rentalItems && rental.rentalItems.length > 0) {
      rental.rentalItems.forEach(item => {
        if (item.device && !processedDeviceIds.has(item.device.id)) {
          devices.push(calculatePaymentStatus(rental, item));
          processedDeviceIds.add(item.device.id);
        }
      });
    }
    
    // Fallback to old structure only if no new structure data
    if (devices.length === 0 && rental.devices) {
      rental.devices.forEach(device => {
        if (!processedDeviceIds.has(device.id)) {
          devices.push(calculatePaymentStatus(rental, device));
          processedDeviceIds.add(device.id);
        }
      });
    }
    
    return devices;
  }, [calculatePaymentStatus]);

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ENDING_SOON':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // Get payment status text
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'ENDING_SOON':
        return 'Bientôt dû';
      case 'CRITICAL':
        return 'Critique';
      case 'OVERDUE':
        return 'En retard';
      case 'PENDING':
      default:
        return 'Aucun paiement';
    }
  };

  // Get payment type color
  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'CHEQUE':
        return 'bg-blue-100 text-blue-800';
      case 'TRAITE':
        return 'bg-purple-100 text-purple-800';
      case 'CNAM':
        return 'bg-orange-100 text-orange-800';
      case 'VIREMENT':
        return 'bg-indigo-100 text-indigo-800';
      case 'MONDAT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get month from date string
  const getMonthFromDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Filter and search rentals
  useEffect(() => {
    let filtered = rentals;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(rental =>
        rental.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.patient.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.patient.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.patient.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.patient.technician?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.patient.supervisor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(rental => rental.status === statusFilter);
    }

    // Apply return status filter
    if (returnStatusFilter !== "all") {
      filtered = filtered.filter(rental => rental.returnStatus === returnStatusFilter);
    }

    // Apply payment status filter
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(rental => {
        const devices = getDevicesWithPaymentStatus(rental);
        return devices.some(device => device.paymentStatus === paymentStatusFilter);
      });
    }

    // Apply month filters
    if (reminderMonthFilter !== "all") {
      filtered = filtered.filter(rental => {
        const devices = getDevicesWithPaymentStatus(rental);
        return devices.some(device => 
          device.reminderDate && getMonthFromDate(device.reminderDate) === reminderMonthFilter
        );
      });
    }

    if (paymentEndMonthFilter !== "all") {
      filtered = filtered.filter(rental => {
        const devices = getDevicesWithPaymentStatus(rental);
        return devices.some(device => 
          device.paymentEndDate && getMonthFromDate(device.paymentEndDate) === paymentEndMonthFilter
        );
      });
    }

    if (rentalEndMonthFilter !== "all") {
      filtered = filtered.filter(rental => {
        const devices = getDevicesWithPaymentStatus(rental);
        return devices.some(device => 
          getMonthFromDate(device.rentalEndDate) === rentalEndMonthFilter
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case "patient":
          aValue = a.patient.fullName;
          bValue = b.patient.fullName;
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "endDate":
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        case "startDate":
        default:
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRentals(filtered);
    setCurrentPage(1);
  }, [rentals, searchTerm, statusFilter, returnStatusFilter, paymentStatusFilter, reminderMonthFilter, paymentEndMonthFilter, rentalEndMonthFilter, sortBy, sortOrder, getDevicesWithPaymentStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRentals = filteredRentals.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getPaymentStatusStats = () => {
    const stats = { paid: 0, endingSoon: 0, critical: 0, overdue: 0, pending: 0 };
    
    filteredRentals.forEach(rental => {
      const devices = getDevicesWithPaymentStatus(rental);
      devices.forEach(device => {
        switch (device.paymentStatus) {
          case 'PAID':
            stats.paid++;
            break;
          case 'ENDING_SOON':
            stats.endingSoon++;
            break;
          case 'CRITICAL':
            stats.critical++;
            break;
          case 'OVERDUE':
            stats.overdue++;
            break;
          case 'PENDING':
          default:
            stats.pending++;
            break;
        }
      });
    });
    
    return stats;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-slate-600 font-medium">Chargement des locations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Suivi des Locations d&apos;Appareils</h3>
        </div>
        <div className="p-8 text-center">
          <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-slate-800 mb-2">Aucune location trouvée</h4>
          <p className="text-slate-600 mb-6">Commencez par créer votre première location</p>
          <Link 
            href="/employee/rentals" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Créer une location
          </Link>
        </div>
      </div>
    );
  }

  const paymentStats = getPaymentStatusStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Suivi des Locations d&apos;Appareils</h3>
          <div className="flex items-center space-x-4">
            <div className="text-purple-100 text-sm">
              {filteredRentals.length} location(s) trouvée(s)
            </div>
            <Link
              href="/employee/rentals"
              className="text-purple-100 hover:text-white transition-colors text-sm font-medium"
            >
              Nouvelle location
            </Link>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par patient, téléphone, région, médecin, technicien..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Complété</option>
              <option value="CANCELLED">Annulé</option>
            </select>

            <select
              value={returnStatusFilter}
              onChange={(e) => setReturnStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">Statut retour</option>
              <option value="RETURNED">Retourné</option>
              <option value="NOT_RETURNED">Non retourné</option>
              <option value="PARTIALLY_RETURNED">Retour partiel</option>
              <option value="DAMAGED">Endommagé</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">Statut paiement</option>
              <option value="PAID">Payé</option>
              <option value="ENDING_SOON">Bientôt dû</option>
              <option value="CRITICAL">Critique</option>
              <option value="OVERDUE">En retard</option>
              <option value="PENDING">Aucun paiement</option>
            </select>

            <select
              value={reminderMonthFilter}
              onChange={(e) => setReminderMonthFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">Rappel par mois</option>
              <option value="2025-01">Janvier 2025</option>
              <option value="2025-02">Février 2025</option>
              <option value="2025-03">Mars 2025</option>
              <option value="2025-04">Avril 2025</option>
              <option value="2025-05">Mai 2025</option>
              <option value="2025-06">Juin 2025</option>
              <option value="2025-07">Juillet 2025</option>
              <option value="2025-08">Août 2025</option>
              <option value="2025-09">Septembre 2025</option>
              <option value="2025-10">Octobre 2025</option>
              <option value="2025-11">Novembre 2025</option>
              <option value="2025-12">Décembre 2025</option>
            </select>

            <select
              value={paymentEndMonthFilter}
              onChange={(e) => setPaymentEndMonthFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">Fin paiement par mois</option>
              <option value="2025-01">Janvier 2025</option>
              <option value="2025-02">Février 2025</option>
              <option value="2025-03">Mars 2025</option>
              <option value="2025-04">Avril 2025</option>
              <option value="2025-05">Mai 2025</option>
              <option value="2025-06">Juin 2025</option>
              <option value="2025-07">Juillet 2025</option>
              <option value="2025-08">Août 2025</option>
              <option value="2025-09">Septembre 2025</option>
              <option value="2025-10">Octobre 2025</option>
              <option value="2025-11">Novembre 2025</option>
              <option value="2025-12">Décembre 2025</option>
            </select>

            <select
              value={rentalEndMonthFilter}
              onChange={(e) => setRentalEndMonthFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">Fin location par mois</option>
              <option value="2025-01">Janvier 2025</option>
              <option value="2025-02">Février 2025</option>
              <option value="2025-03">Mars 2025</option>
              <option value="2025-04">Avril 2025</option>
              <option value="2025-05">Mai 2025</option>
              <option value="2025-06">Juin 2025</option>
              <option value="2025-07">Juillet 2025</option>
              <option value="2025-08">Août 2025</option>
              <option value="2025-09">Septembre 2025</option>
              <option value="2025-10">Octobre 2025</option>
              <option value="2025-11">Novembre 2025</option>
              <option value="2025-12">Décembre 2025</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="startDate-desc">Date début (Plus récent)</option>
              <option value="startDate-asc">Date début (Plus ancien)</option>
              <option value="endDate-desc">Date fin (Plus récent)</option>
              <option value="endDate-asc">Date fin (Plus ancien)</option>
              <option value="patient-asc">Patient (A-Z)</option>
              <option value="patient-desc">Patient (Z-A)</option>
              <option value="amount-desc">Montant (Plus élevé)</option>
              <option value="amount-asc">Montant (Plus bas)</option>
            </select>
          </div>
        </div>

        {/* Payment Status Statistics */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-slate-600">Payé: {paymentStats.paid}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-slate-600">Bientôt dû: {paymentStats.endingSoon}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
            <span className="text-slate-600">Critique: {paymentStats.critical}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-slate-600">En retard: {paymentStats.overdue}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span className="text-slate-600">Aucun paiement: {paymentStats.pending}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("patient")}
              >
                <div className="flex items-center">
                  Patient
                  {sortBy === "patient" && (
                    <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Médecin
              </th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Technicien
              </th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Superviseur
              </th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Créé par
              </th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Appareils & Paiements
              </th>
              <th 
                scope="col" 
                className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("endDate")}
              >
                <div className="flex items-center">
                  Dates
                  {sortBy === "endDate" && (
                    <svg className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {currentRentals.map((rental, index) => {
              const devicesWithStatus = getDevicesWithPaymentStatus(rental);
              
              return (
                <tr 
                  key={rental.id} 
                  className={`hover:bg-slate-50 transition-colors duration-150 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}
                  onClick={() => window.location.href = `/employee/patients/${rental.patient.id}`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                          {rental.patient.fullName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900">{rental.patient.fullName}</div>
                        <div className="text-xs text-slate-500">
                          {rental.patient.phone && `${rental.patient.phone}`}
                          {rental.patient.region && ` • ${rental.patient.region}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {rental.patient.doctorName ? `Dr. ${rental.patient.doctorName}` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {rental.patient.technician?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {rental.patient.technician?.role || ''}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {rental.patient.supervisor?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {rental.patient.supervisor?.role || ''}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {rental.createdBy?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {rental.createdBy?.email || ''}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-3">
                      {devicesWithStatus.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">Aucun appareil en cours de location</div>
                      ) : (
                        devicesWithStatus.map((device, deviceIndex) => (
                          <div key={deviceIndex} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-slate-900">{device.name}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getPaymentTypeColor(device.paymentType)}`}>
                                  {device.paymentType}
                                </span>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full border ${getPaymentStatusColor(device.paymentStatus)}`}>
                                {getPaymentStatusText(device.paymentStatus)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-slate-600">
                                <div className="font-medium">Jours restants:</div>
                                <div className={`font-semibold ${
                                  (() => {
                                    if (!device.paymentEndDate) return 'text-slate-600';
                                    const today = new Date();
                                    const paymentEnd = new Date(device.paymentEndDate);
                                    const daysRemaining = Math.ceil((paymentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (daysRemaining > 30) return 'text-green-600';
                                    if (daysRemaining >= 1 && daysRemaining <= 30) return 'text-orange-600';
                                    return 'text-red-600';
                                  })()
                                }`}>
                                  {(() => {
                                    if (!device.paymentEndDate) return 'N/A';
                                    const today = new Date();
                                    const paymentEnd = new Date(device.paymentEndDate);
                                    const daysRemaining = Math.ceil((paymentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (daysRemaining <= 0) {
                                      return `${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) !== 1 ? 's' : ''} de retard`;
                                    }
                                    return `${daysRemaining} jour${daysRemaining !== 1 ? 's' : ''}`;
                                  })()}
                                </div>
                              </div>
                              <div className="text-slate-600">
                                <div className="font-medium">Rappel:</div>
                                <div className="text-slate-900">
                                  {(() => {
                                    if (!device.paymentEndDate) return 'N/A';
                                    const today = new Date();
                                    const paymentEnd = new Date(device.paymentEndDate);
                                    const daysRemaining = Math.ceil((paymentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    let reminderDays;
                                    if (daysRemaining > 30) {
                                      reminderDays = 30; // Rappel 30 jours avant pour les paiements > 30 jours
                                    } else if (daysRemaining >= 1 && daysRemaining <= 30) {
                                      reminderDays = 5; // Rappel 5 jours avant pour les paiements 1-30 jours
                                    } else {
                                      return 'Dépassé';
                                    }
                                    
                                    const reminderDate = new Date(paymentEnd);
                                    reminderDate.setDate(reminderDate.getDate() - reminderDays);
                                    
                                    return formatDate(reminderDate.toISOString());
                                  })()}
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced overdue warning */}
                            {device.paymentStatus === 'OVERDUE' && device.overdueDays && device.overdueDays > 0 && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                <div className="flex items-center text-red-700">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">
                                    Paiement en retard de {device.overdueDays} jour{device.overdueDays !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="mt-1 text-red-600">
                                  Solde restant: {device.outstandingAmount.toFixed(2)} TND
                                </div>
                              </div>
                            )}
                            
                            {/* Critical payment warning */}
                            {device.paymentStatus === 'CRITICAL' && (
                              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                <div className="flex items-center text-orange-700">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="font-medium">Paiement critique - Action requise</span>
                                </div>
                                <div className="mt-1 text-orange-600">
                                  Échéance: {device.paymentEndDate ? formatDate(device.paymentEndDate) : 'N/A'}
                                </div>
                              </div>
                            )}
                            
                            {rental.notes && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="flex items-start">
                                  <svg className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <div className="text-xs text-blue-700">
                                    <div className="font-medium">Note:</div>
                                    <div>{rental.notes}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      {devicesWithStatus.length === 0 ? (
                        <div className="text-sm text-slate-500 italic">Aucun appareil actif</div>
                      ) : (
                        devicesWithStatus.map((device, deviceIndex) => (
                          <div key={deviceIndex} className="text-sm">
                            <div className="font-medium text-slate-700 mb-1">{device.name}</div>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="text-xs text-slate-500 mr-2">Jours restants:</span>
                                <span className={`font-semibold text-sm px-2 py-1 rounded ${
                                  (() => {
                                    if (!device.paymentEndDate) return 'bg-slate-100 text-slate-600';
                                    const today = new Date();
                                    const paymentEnd = new Date(device.paymentEndDate);
                                    const daysRemaining = Math.ceil((paymentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (daysRemaining > 30) return 'bg-green-100 text-green-700';
                                    if (daysRemaining >= 1 && daysRemaining <= 30) return 'bg-orange-100 text-orange-700';
                                    return 'bg-red-100 text-red-700';
                                  })()
                                }`}>
                                  {(() => {
                                    if (!device.paymentEndDate) return 'N/A';
                                    const today = new Date();
                                    const paymentEnd = new Date(device.paymentEndDate);
                                    const daysRemaining = Math.ceil((paymentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (daysRemaining <= 0) {
                                      return `${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) !== 1 ? 's' : ''} de retard`;
                                    }
                                    return `${daysRemaining} jour${daysRemaining !== 1 ? 's' : ''}`;
                                  })()}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-slate-500 mr-2">Rappel:</span>
                                <span className="text-xs text-slate-700">
                                  {(() => {
                                    if (!device.paymentEndDate) return 'N/A';
                                    const today = new Date();
                                    const paymentEnd = new Date(device.paymentEndDate);
                                    const daysRemaining = Math.ceil((paymentEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    let reminderDays;
                                    if (daysRemaining > 30) {
                                      reminderDays = 30; // Rappel 30 jours avant pour les paiements > 30 jours
                                    } else if (daysRemaining >= 1 && daysRemaining <= 30) {
                                      reminderDays = 5; // Rappel 5 jours avant pour les paiements 1-30 jours
                                    } else {
                                      return 'Dépassé';
                                    }
                                    
                                    const reminderDate = new Date(paymentEnd);
                                    reminderDate.setDate(reminderDate.getDate() - reminderDays);
                                    
                                    return formatDate(reminderDate.toISOString());
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rental.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        rental.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rental.status === 'COMPLETED' ? 'Complété' : 
                         rental.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                      </span>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rental.returnStatus === 'RETURNED' ? 'bg-green-100 text-green-800' :
                          rental.returnStatus === 'NOT_RETURNED' ? 'bg-yellow-100 text-yellow-800' :
                          rental.returnStatus === 'PARTIALLY_RETURNED' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rental.returnStatus === 'RETURNED' ? 'Retourné' :
                           rental.returnStatus === 'NOT_RETURNED' ? 'Non retourné' :
                           rental.returnStatus === 'PARTIALLY_RETURNED' ? 'Retour partiel' :
                           'Endommagé'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-600">
              <span>
                Affichage de {startIndex + 1} à {Math.min(endIndex, filteredRentals.length)} sur {filteredRentals.length} locations
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
