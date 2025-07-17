"use client";

import { useState } from "react";

// Define proper types based on actual database structure
interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  // Note: price field doesn't exist in actual database
}

interface Accessory {
  id: string;
  name: string;
  model: string;
  quantity: number;
  // Note: price field doesn't exist in actual database
}

interface RentalItem {
  id: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  device?: Device;
  accessory?: Accessory;
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  paymentDate?: string;
  notes?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  cnamStatus?: string;
}

interface Sale {
  id: string;
  date: string;
  amount: number;
  status: string;
  notes?: string;
  devices: Device[];
  accessories: Accessory[];
  payments: Payment[];
}

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  returnStatus: string;
  notes?: string;
  actualReturnDate?: string;
  devices: Device[];
  accessories: Accessory[];
  payments: Payment[];
  rentalItems: RentalItem[];
}

interface DeviceRecord {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  type: 'sale' | 'rental';
  status: 'sold' | 'rented' | 'returned' | 'pending';
  date: string;
  endDate?: string;
  // Enhanced pricing information
  calculatedPrice: number; // Price calculated from transaction
  unitPrice?: number; // For rentals
  totalPrice: number;
  quantity: number;
  // Enhanced details
  notes?: string;
  transactionNotes?: string;
  sourceId: string;
  sourceDetails: {
    type: 'sale' | 'rental';
    date: string;
    totalAmount: number;
    status: string;
    returnStatus?: string;
  };
  // Payment information
  payments: Payment[];
  // Accessories
  accessories?: {
    name: string;
    model: string;
    quantity: number;
    calculatedPrice: number;
  }[];
}

interface PatientDevicesTrackerProps {
  sales: Sale[];
  rentals: Rental[];
  patientId: string;
}

export default function PatientDevicesTracker({ sales, rentals }: PatientDevicesTrackerProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAccessories, setShowAccessories] = useState(false);
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());

  // Aggregate all devices from sales and rentals
  const allDevices: DeviceRecord[] = [];
  
  // Add devices from sales
  sales.forEach(sale => {
    const deviceCount = sale.devices.length;
    const accessoryCount = sale.accessories.length;
    const totalItems = deviceCount + accessoryCount;
    
    // Calculate price per device (distribute total amount among all items)
    const pricePerItem = totalItems > 0 ? sale.amount / totalItems : 0;
    
    sale.devices?.forEach((device: Device) => {
      allDevices.push({
        id: device.id,
        name: device.name,
        model: device.model,
        serialNumber: device.serialNumber,
        type: 'sale',
        status: 'sold',
        date: sale.date,
        calculatedPrice: pricePerItem,
        totalPrice: pricePerItem,
        quantity: 1,
        notes: undefined,
        transactionNotes: sale.notes,
        sourceId: sale.id,
        sourceDetails: {
          type: 'sale',
          date: sale.date,
          totalAmount: sale.amount,
          status: sale.status
        },
        payments: sale.payments || [],
        accessories: sale.accessories?.map((acc: Accessory) => ({
          name: acc.name,
          model: acc.model,
          quantity: acc.quantity,
          calculatedPrice: pricePerItem * acc.quantity
        })) || []
      });
    });
  });

  // Add devices from rentals
  rentals.forEach(rental => {
    const deviceCount = rental.devices.length;
    const accessoryCount = rental.accessories.length;
    const totalItems = deviceCount + accessoryCount;
    
    // Calculate price per device (distribute total amount among all items)
    const pricePerItem = totalItems > 0 ? rental.amount / totalItems : 0;
    
    // Add devices from direct rental.devices (old structure)
    rental.devices?.forEach((device: Device) => {
      allDevices.push({
        id: device.id,
        name: device.name,
        model: device.model,
        serialNumber: device.serialNumber,
        type: 'rental',
        status: rental.returnStatus === 'RETURNED' ? 'returned' : 'rented',
        date: rental.startDate,
        endDate: rental.endDate,
        calculatedPrice: pricePerItem,
        totalPrice: pricePerItem,
        quantity: 1,
        notes: undefined,
        transactionNotes: rental.notes,
        sourceId: rental.id,
        sourceDetails: {
          type: 'rental',
          date: rental.startDate,
          totalAmount: rental.amount,
          status: rental.status,
          returnStatus: rental.returnStatus
        },
        payments: rental.payments || [],
        accessories: rental.accessories?.map((acc: Accessory) => ({
          name: acc.name,
          model: acc.model,
          quantity: acc.quantity,
          calculatedPrice: pricePerItem * acc.quantity
        })) || []
      });
    });

    // Add devices from rental items (new structure)
    rental.rentalItems?.forEach((item: RentalItem) => {
      if (item.device) {
        allDevices.push({
          id: item.device.id,
          name: item.device.name,
          model: item.device.model,
          serialNumber: item.device.serialNumber,
          type: 'rental',
          status: rental.returnStatus === 'RETURNED' ? 'returned' : 'rented',
          date: item.startDate,
          endDate: item.endDate,
          calculatedPrice: item.totalPrice / item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          quantity: item.quantity,
          notes: item.notes,
          transactionNotes: rental.notes,
          sourceId: rental.id,
          sourceDetails: {
            type: 'rental',
            date: rental.startDate,
            totalAmount: rental.amount,
            status: rental.status,
            returnStatus: rental.returnStatus
          },
          payments: item.payments || []
        });
      }
    });
  });

  // Remove duplicates based on device ID and source
  const uniqueDevices = allDevices.filter((device, index, self) => 
    index === self.findIndex(d => d.id === device.id && d.sourceId === device.sourceId)
  );

  // Filter devices
  const filteredDevices = uniqueDevices.filter(device => {
    if (selectedType !== 'all' && device.type !== selectedType) return false;
    if (selectedStatus !== 'all' && device.status !== selectedStatus) return false;
    return true;
  });

  // Sort devices
  const sortedDevices = [...filteredDevices].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc' ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
    }
  });

  // Calculate statistics
  const totalDevices = uniqueDevices.length;
  const soldDevices = uniqueDevices.filter(d => d.status === 'sold').length;
  const rentedDevices = uniqueDevices.filter(d => d.status === 'rented').length;
  const returnedDevices = uniqueDevices.filter(d => d.status === 'returned').length;
  const totalValue = uniqueDevices.reduce((sum, device) => sum + device.totalPrice, 0);

  // Get devices by brand/manufacturer
  const devicesByBrand = uniqueDevices.reduce((acc, device) => {
    // Extract brand from device name (assume first word is brand)
    const brand = device.name.split(' ')[0];
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get devices ending soon (rentals)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const devicesEndingSoon = uniqueDevices.filter(device => 
    device.type === 'rental' && 
    device.status === 'rented' && 
    device.endDate && 
    new Date(device.endDate) <= sevenDaysFromNow
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sold':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getDaysUntilReturn = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleDeviceExpansion = (deviceId: string) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (totalDevices === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Appareils</h2>
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Aucun appareil enregistré</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Appareils</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showAccessories}
              onChange={(e) => setShowAccessories(e.target.checked)}
              className="form-checkbox text-blue-600"
            />
            <span className="text-sm text-gray-600">Afficher les accessoires</span>
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total appareils</p>
          <p className="text-2xl font-bold text-blue-700">{totalDevices}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Vendus</p>
          <p className="text-2xl font-bold text-green-700">{soldDevices}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">En location</p>
          <p className="text-2xl font-bold text-purple-700">{rentedDevices}</p>
          <p className="text-xs text-purple-600">{returnedDevices} retournés</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Valeur totale</p>
          <p className="text-2xl font-bold text-yellow-700">{formatPrice(totalValue)}</p>
        </div>
      </div>

      {/* Alerts */}
      {devicesEndingSoon.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Alertes</h3>
          <p className="text-sm text-yellow-700">
            {devicesEndingSoon.length} appareil(s) à retourner dans les 7 prochains jours
          </p>
        </div>
      )}

      {/* Device Brands Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Répartition par marque</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(devicesByBrand).map(([brand, count]) => (
            <div key={brand} className="flex items-center bg-white px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-700">{brand}</span>
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">Tous</option>
            <option value="sale">Ventes</option>
            <option value="rental">Locations</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Statut:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">Tous</option>
            <option value="sold">Vendus</option>
            <option value="rented">En location</option>
            <option value="returned">Retournés</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Trier par:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'price')}
            className="px-3 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="date">Date</option>
            <option value="name">Nom</option>
            <option value="price">Prix</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        {sortedDevices.map((device) => {
          const daysUntilReturn = device.endDate ? getDaysUntilReturn(device.endDate) : null;
          const isExpanded = expandedDevices.has(device.id + device.sourceId);
          
          return (
            <div key={device.id + device.sourceId} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Main Device Info */}
              <div className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{device.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(device.type)}`}>
                        {device.type === 'sale' ? 'Vente' : 'Location'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(device.status)}`}>
                        {device.status === 'sold' ? 'Vendu' : 
                         device.status === 'rented' ? 'En location' : 
                         device.status === 'returned' ? 'Retourné' : device.status}
                      </span>
                      {device.status === 'rented' && daysUntilReturn !== null && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          daysUntilReturn <= 0 ? 'bg-red-100 text-red-800' :
                          daysUntilReturn <= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {daysUntilReturn <= 0 ? 'En retard' : `${daysUntilReturn}j restants`}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Modèle:</strong> {device.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Série:</strong> {device.serialNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Quantité:</strong> {device.quantity}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Date:</strong> {new Date(device.date).toLocaleDateString('fr-FR')}
                        </p>
                        {device.endDate && (
                          <p className="text-sm text-gray-600">
                            <strong>Fin prévue:</strong> {new Date(device.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Transaction:</strong> #{device.sourceId.slice(-8)}
                        </p>
                      </div>

                                              <div>
                          <p className="text-sm text-gray-600">
                            <strong>Prix calculé:</strong> {formatPrice(device.calculatedPrice)}
                          </p>
                          {device.unitPrice && (
                            <p className="text-sm text-gray-600">
                              <strong>Prix unitaire:</strong> {formatPrice(device.unitPrice)}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <strong>Prix total:</strong> <span className="font-semibold text-gray-900">{formatPrice(device.totalPrice)}</span>
                          </p>
                        </div>
                    </div>

                    {/* Notes */}
                    {(device.notes || device.transactionNotes) && (
                      <div className="mb-3">
                        {device.notes && (
                          <div className="bg-blue-50 p-2 rounded text-sm">
                            <strong className="text-blue-800">Note appareil:</strong> 
                            <span className="text-blue-700 ml-1">{device.notes}</span>
                          </div>
                        )}
                        {device.transactionNotes && (
                          <div className="bg-gray-50 p-2 rounded text-sm mt-1">
                            <strong className="text-gray-800">Note transaction:</strong> 
                            <span className="text-gray-700 ml-1">{device.transactionNotes}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => toggleDeviceExpansion(device.id + device.sourceId)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {isExpanded ? '▼ Masquer les détails' : '▶ Voir les détails'}
                    </button>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(device.totalPrice)}</p>
                    <p className="text-sm text-gray-500">
                      {device.type === 'sale' ? 'Prix de vente' : 'Prix location'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Details */}
                    {device.payments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Paiements</h4>
                        <div className="space-y-2">
                          {device.payments.map((payment) => (
                            <div key={payment.id} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatPrice(payment.amount)}
                                  </p>
                                                                     <p className="text-xs text-gray-600">
                                     {payment.type} • {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('fr-FR') : 'Date non définie'}
                                   </p>
                                  {payment.periodStartDate && payment.periodEndDate && (
                                    <p className="text-xs text-gray-500">
                                      Période: {new Date(payment.periodStartDate).toLocaleDateString('fr-FR')} - {new Date(payment.periodEndDate).toLocaleDateString('fr-FR')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {payment.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic">
                                  {payment.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Accessories */}
                    {showAccessories && device.accessories && device.accessories.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Accessoires associés</h4>
                        <div className="space-y-2">
                          {device.accessories.map((accessory, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{accessory.name}</p>
                                  <p className="text-xs text-gray-600">{accessory.model}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatPrice(accessory.calculatedPrice)}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Qté: {accessory.quantity}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedDevices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun appareil ne correspond aux filtres sélectionnés</p>
        </div>
      )}
    </div>
  );
} 