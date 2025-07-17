"use client";


import { SALETYPE, RENTAL_ITEM_TYPE } from "@prisma/client";
import RentalItemForm from "./RentalItemForm";
import DeviceWithAccessoriesForm, { DeviceWithAccessories } from "./DeviceWithAccessoriesForm";
import RentalItemsList from "./RentalItemsList";
import RentalGroupsManager from "./RentalGroupsManager";
import FinancialSummary from "./FinancialSummary";

type Patient = {
  id: string;
  fullName: string;
  phone: string;
  region: string;
  address?: string;
  doctorName?: string;
};

type PaymentEntry = {
  method: SALETYPE;
  amount: number;
  paymentDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  // Additional fields for specific payment types
  cashTotal?: number;
  cashAcompte?: number;
  cashRest?: number;
  cashRestDate?: string;
  cnamStatus?: "ATTENTE" | "ACCORD";
  cnamFollowupDate?: string;
  traiteDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
};

type RentalItem = {
  id?: string;
  itemType: RENTAL_ITEM_TYPE;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  // Device or Accessory details
  deviceData?: {
    name: string;
    model: string;
    serialNumber: string;
  };
  accessoryData?: {
    name: string;
    model: string;
  };
  payments: PaymentEntry[];
};

// New type for grouped items that can share payments
type RentalGroup = {
  id: string;
  name: string;
  description?: string;
  items: RentalItem[];
  sharedPayments: PaymentEntry[];
  startDate: string;
  endDate: string;
  notes?: string;
  totalPrice?: number;
};

type RentalFormData = {
  patientId: string;
  startDate: string;
  endDate: string;
  rentalItems: RentalItem[];
  rentalGroups: RentalGroup[];
  totalAmount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  returnStatus: "NOT_RETURNED" | "RETURNED_COMPLETE" | "RETURNED_INCOMPLETE";
  notes?: string;
};

interface RentalDetailsStepProps {
  patient: Patient;
  rentalData: RentalFormData;
  onRentalDataChange: (data: RentalFormData) => void;
  onPrevious: () => void;
  onSubmit: (data: RentalFormData) => void;
  isLoading: boolean;
  error: string;
}

export default function RentalDetailsStep({
  patient,
  rentalData,
  onRentalDataChange,
  onPrevious,
  onSubmit,
  isLoading,
  error
}: RentalDetailsStepProps) {
  // Initialize rentalGroups if not present
  const currentRentalData = {
    ...rentalData,
    rentalGroups: rentalData.rentalGroups || []
  };

  // Calculate total amount from all rental items and groups
  const calculateTotalAmount = (items: RentalItem[], groups: RentalGroup[] = []): number => {
    const itemsTotal = items.reduce((total, item) => total + item.totalPrice, 0);
    const groupsTotal = groups.reduce((total, group) => {
      return total + group.items.reduce((groupTotal, item) => groupTotal + item.totalPrice, 0);
    }, 0);
    return itemsTotal + groupsTotal;
  };

  // Convert DeviceWithAccessories to RentalItems
  const convertDeviceWithAccessoriesToRentalItems = (deviceWithAccessories: DeviceWithAccessories): RentalItem[] => {
    const items: RentalItem[] = [];
    
    // Add the device as a rental item
    items.push({
      itemType: RENTAL_ITEM_TYPE.DEVICE,
      quantity: deviceWithAccessories.deviceQuantity,
      unitPrice: deviceWithAccessories.deviceUnitPrice,
      totalPrice: deviceWithAccessories.deviceTotalPrice,
      startDate: deviceWithAccessories.startDate,
      endDate: deviceWithAccessories.endDate,
      notes: deviceWithAccessories.notes,
      deviceData: deviceWithAccessories.deviceData,
      payments: deviceWithAccessories.devicePayments
    });

    // Add linked accessories as rental items
    deviceWithAccessories.linkedAccessories.forEach(accessory => {
      items.push({
        itemType: RENTAL_ITEM_TYPE.ACCESSORY,
        quantity: accessory.quantity,
        unitPrice: accessory.unitPrice,
        totalPrice: accessory.totalPrice,
        startDate: deviceWithAccessories.startDate,
        endDate: deviceWithAccessories.endDate,
        notes: accessory.notes,
        accessoryData: {
          name: accessory.name,
          model: accessory.model
        },
        payments: accessory.payments
      });
    });

    return items;
  };

  // Add a new rental item
  const handleAddRentalItem = (itemData: RentalItem) => {
    const updatedItems = [...currentRentalData.rentalItems, itemData];
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Add device with accessories
  const handleAddDeviceWithAccessories = (deviceWithAccessories: DeviceWithAccessories) => {
    const newItems = convertDeviceWithAccessoriesToRentalItems(deviceWithAccessories);
    const updatedItems = [...currentRentalData.rentalItems, ...newItems];
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Edit an existing rental item
  const handleEditItem = (index: number, updatedItem: RentalItem) => {
    const updatedItems = [...currentRentalData.rentalItems];
    updatedItems[index] = updatedItem;
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Remove a rental item
  const handleRemoveRentalItem = (index: number) => {
    const updatedItems = currentRentalData.rentalItems.filter((_, i) => i !== index);
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Edit payment
  const handleEditPayment = (itemIndex: number, paymentIndex: number, updatedPayment: PaymentEntry) => {
    const updatedItems = [...currentRentalData.rentalItems];
    updatedItems[itemIndex].payments[paymentIndex] = updatedPayment;
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Add payment to existing item
  const handleAddPaymentToItem = (itemIndex: number, payment: PaymentEntry) => {
    const updatedItems = [...currentRentalData.rentalItems];
    updatedItems[itemIndex].payments.push(payment);
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Remove payment from a specific rental item
  const handleRemovePaymentFromItem = (itemIndex: number, paymentIndex: number) => {
    const updatedItems = [...currentRentalData.rentalItems];
    updatedItems[itemIndex].payments = updatedItems[itemIndex].payments.filter((_, i) => i !== paymentIndex);
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      totalAmount: calculateTotalAmount(updatedItems, currentRentalData.rentalGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Create a group from selected items or create a standalone group
  const handleCreateGroup = (groupName: string, selectedItemIndices: number[], standaloneGroup?: RentalGroup) => {
    if (standaloneGroup) {
      // Handle standalone group creation
      const newGroup: RentalGroup = {
        ...standaloneGroup,
        id: Date.now().toString(),
        items: standaloneGroup.items || [], // Ensure items array exists
        sharedPayments: standaloneGroup.sharedPayments || [], // Ensure sharedPayments array exists
      };

      const updatedGroups = [...currentRentalData.rentalGroups, newGroup];
      const updatedData = {
        ...currentRentalData,
        rentalGroups: updatedGroups,
        totalAmount: calculateTotalAmount(currentRentalData.rentalItems, updatedGroups)
      };

      onRentalDataChange(updatedData);
    } else {
      // Handle group creation from selected items
      const selectedItems = selectedItemIndices.map(index => currentRentalData.rentalItems[index]);
      const remainingItems = currentRentalData.rentalItems.filter((_, index) => !selectedItemIndices.includes(index));

      const newGroup: RentalGroup = {
        id: Date.now().toString(),
        name: groupName,
        items: selectedItems,
        sharedPayments: [],
        startDate: Math.min(...selectedItems.map(item => new Date(item.startDate).getTime())).toString(),
        endDate: Math.max(...selectedItems.map(item => new Date(item.endDate).getTime())).toString(),
        totalPrice: selectedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      };

      const updatedGroups = [...currentRentalData.rentalGroups, newGroup];
      const updatedData = {
        ...currentRentalData,
        rentalItems: remainingItems,
        rentalGroups: updatedGroups,
        totalAmount: calculateTotalAmount(remainingItems, updatedGroups)
      };

      onRentalDataChange(updatedData);
    }
  };

  // Add shared payment to group
  const handleAddSharedPaymentToGroup = (groupIndex: number, payment: PaymentEntry) => {
    const updatedGroups = [...currentRentalData.rentalGroups];
    updatedGroups[groupIndex].sharedPayments.push(payment);
    const updatedData = {
      ...currentRentalData,
      rentalGroups: updatedGroups,
      totalAmount: calculateTotalAmount(currentRentalData.rentalItems, updatedGroups)
    };
    onRentalDataChange(updatedData);
  };

  // Remove group and move items back to individual items
  const handleRemoveGroup = (groupIndex: number) => {
    const group = currentRentalData.rentalGroups[groupIndex];
    const updatedItems = [...currentRentalData.rentalItems, ...group.items];
    const updatedGroups = currentRentalData.rentalGroups.filter((_, i) => i !== groupIndex);
    const updatedData = {
      ...currentRentalData,
      rentalItems: updatedItems,
      rentalGroups: updatedGroups,
      totalAmount: calculateTotalAmount(updatedItems, updatedGroups)
    };
    onRentalDataChange(updatedData);
  };

  const totalAmount = calculateTotalAmount(currentRentalData.rentalItems, currentRentalData.rentalGroups);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have items or groups
    const hasItems = currentRentalData.rentalItems.length > 0;
    const hasGroups = currentRentalData.rentalGroups.length > 0;
    
    if (!hasItems && !hasGroups) {
      alert("Vous devez ajouter au moins un élément individuel ou créer un groupe.");
      return;
    }
    
    // Calculate total payments
    const totalPayments = calculateTotalPayments(currentRentalData.rentalItems, currentRentalData.rentalGroups);
    const totalAmount = calculateTotalAmount(currentRentalData.rentalItems, currentRentalData.rentalGroups);
    
    // Only require payments if there are paid items (totalAmount > 0)
    if (totalAmount > 0 && totalPayments === 0) {
      alert("Vous devez ajouter au moins un paiement aux éléments ou aux groupes.");
      return;
    }
    
    // Validate that all items have payments or are in groups with payments (excluding free items)
    const itemsWithoutPayments = currentRentalData.rentalItems.filter(item => 
      item.payments.length === 0 && item.totalPrice > 0
    );
    
    // Improved group payment validation
    const groupsWithoutPayments = currentRentalData.rentalGroups.filter(group => {
      const hasSharedPayments = group.sharedPayments && group.sharedPayments.length > 0;
      const hasItemPayments = group.items && group.items.some(item => 
        item.payments && item.payments.length > 0 && item.totalPrice > 0
      );
      
      // Check if group has any paid items that need payments
      const hasPaidItems = group.items && group.items.some(item => item.totalPrice > 0);
      
      // Only require payments if group has paid items and no payments are present
      return hasPaidItems && !hasSharedPayments && !hasItemPayments;
    });
    
    if (itemsWithoutPayments.length > 0) {
      alert(`${itemsWithoutPayments.length} élément(s) individuel(s) payant(s) n'ont pas de paiement. Veuillez ajouter des paiements à tous les éléments payants.`);
      return;
    }
    
    if (groupsWithoutPayments.length > 0) {
      const groupNames = groupsWithoutPayments.map(g => g.name).join(', ');
      alert(`Le(s) groupe(s) "${groupNames}" contiennent des éléments payants sans paiement. Veuillez ajouter des paiements partagés ou des paiements individuels aux éléments payants du groupe.`);
      return;
    }
    
    onSubmit(currentRentalData);
  };

  // Calculate total payments from all sources
  const calculateTotalPayments = (items: RentalItem[], groups: RentalGroup[] = []): number => {
    const itemsPayments = items.reduce((total, item) => {
      return total + item.payments.reduce((sum, payment) => sum + payment.amount, 0);
    }, 0);
    
    const groupsPayments = groups.reduce((total, group) => {
      const itemPayments = group.items ? group.items.reduce((itemTotal, item) => {
        return itemTotal + (item.payments ? item.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0);
      }, 0) : 0;
      
      const sharedPayments = group.sharedPayments ? group.sharedPayments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
      
      return total + itemPayments + sharedPayments;
    }, 0);
    
    return itemsPayments + groupsPayments;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-xl">
        <h2 className="text-xl font-bold text-white">Détails de la location</h2>
      </div>

      <div className="p-6">
        {/* Patient Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Patient sélectionné
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Nom complet</p>
              <p className="text-base font-semibold text-gray-900">{patient.fullName}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Téléphone</p>
              <p className="text-base font-semibold text-gray-900">{patient.phone}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-500">Région</p>
              <p className="text-base font-semibold text-gray-900">{patient.region}</p>
            </div>
            {patient.doctorName && (
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500">Médecin</p>
                <p className="text-base font-semibold text-gray-900">Dr. {patient.doctorName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rental Dates */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Dates de location générales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={currentRentalData.startDate}
                onChange={(e) => onRentalDataChange({ ...currentRentalData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin prévue
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={currentRentalData.endDate}
                min={currentRentalData.startDate}
                onChange={(e) => onRentalDataChange({ ...currentRentalData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chaque élément de location peut avoir ses propres dates spécifiques.
            </p>
          </div>
        </div>

        {/* Add Device with Accessories Form */}
        <DeviceWithAccessoriesForm 
          onAddDeviceWithAccessories={handleAddDeviceWithAccessories}
          defaultStartDate={currentRentalData.startDate}
          defaultEndDate={currentRentalData.endDate}
        />

        {/* Add Individual Rental Item Form */}
        <RentalItemForm 
          onAddRentalItem={handleAddRentalItem}
          defaultStartDate={currentRentalData.startDate}
          defaultEndDate={currentRentalData.endDate}
        />

        {/* Group Management */}
        <RentalGroupsManager
          rentalItems={currentRentalData.rentalItems}
          rentalGroups={currentRentalData.rentalGroups}
          onCreateGroup={handleCreateGroup}
          onRemoveGroup={handleRemoveGroup}
          onAddSharedPaymentToGroup={handleAddSharedPaymentToGroup}
        />

        {/* Individual Rental Items */}
        <RentalItemsList
          rentalItems={currentRentalData.rentalItems}
          onEditItem={handleEditItem}
          onRemoveItem={handleRemoveRentalItem}
          onAddPaymentToItem={handleAddPaymentToItem}
          onRemovePaymentFromItem={handleRemovePaymentFromItem}
          onEditPayment={handleEditPayment}
        />

        {/* Financial Summary */}
        <FinancialSummary
          rentalItems={currentRentalData.rentalItems}
          rentalGroups={currentRentalData.rentalGroups}
        />

        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes générales
          </label>
          <textarea
            id="notes"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            value={currentRentalData.notes || ""}
            onChange={(e) => onRentalDataChange({ ...currentRentalData, notes: e.target.value })}
            placeholder="Notes additionnelles sur cette location..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            onClick={onPrevious}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
          <button
            type="button"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            onClick={handleSubmit}
            disabled={
              isLoading || 
              (currentRentalData.rentalItems.length === 0 && currentRentalData.rentalGroups.length === 0) ||
              totalAmount === 0
            }
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer la location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { RentalFormData, RentalGroup };