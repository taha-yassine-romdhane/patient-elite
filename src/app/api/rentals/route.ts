import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RETURN_STATUS, SALETYPE, TRANSACTION_STATUS, RENTAL_ITEM_TYPE } from '@prisma/client';
import { getCurrentUser } from '@/lib/nextauth-server';

// RentalItem data structure for API request
type RentalItemData = {
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
  // Payments for this specific item
  payments: PaymentData[];
};

// RentalGroup data structure for API request
type RentalGroupData = {
  name: string;
  description?: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  notes?: string;
  items: RentalItemData[];
  sharedPayments: PaymentData[];
};

// Payment data structure for API request
type PaymentData = {
  method: SALETYPE;
  amount: number;
  paymentDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  // Overdue tracking fields
  dueDate?: string;
  overdueDate?: string;
  isOverdue?: boolean;
  overdueDays?: number;
  reminderSent?: boolean;
  // Payment method specific fields
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  cnamStatus?: string;
  cnamFollowupDate?: string;
  notes?: string;
};

// Rental request data structure
type RentalRequestData = {
  patientId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: TRANSACTION_STATUS;
  returnStatus: RETURN_STATUS;
  notes?: string;
  rentalItems: RentalItemData[];
  rentalGroups?: RentalGroupData[];
};

// Helper function to get outstanding balances (moved from export)
async function getOutstandingBalances(patientId: string) {
  try {
    const rentals = await prisma.rental.findMany({
      where: { patientId },
      include: {
        rentalItems: {
          include: {
            payments: true
          }
        }
      }
    });

    const outstandingBalances = rentals.map(rental => {
      const rentalOutstanding = rental.rentalItems.map(item => {
        const totalPaid = item.payments.reduce((sum, payment) => sum + payment.amount, 0);
        return {
          rentalId: rental.id,
          itemId: item.id,
          itemType: item.itemType,
          totalPrice: item.totalPrice,
          totalPaid,
          outstanding: item.totalPrice - totalPaid
        };
      });
      
      return {
        rental,
        items: rentalOutstanding,
        totalOutstanding: rentalOutstanding.reduce((sum, item) => sum + item.outstanding, 0)
      };
    });

    return outstandingBalances;
  } catch (error) {
    console.error('Error fetching outstanding balances:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Authentication requise' },
        { status: 401 }
      );
    }
    
    const body = await request.json() as RentalRequestData;
    
    const { 
      patientId, 
      startDate, 
      endDate, 
      amount, 
      status, 
      returnStatus, 
      notes,
      rentalItems = [],
      rentalGroups = []
    } = body;

    // Validate required fields
    if (!patientId || !startDate || !endDate || amount === undefined) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validate that at least one rental item or group is included
    if (rentalItems.length === 0 && rentalGroups.length === 0) {
      return NextResponse.json(
        { message: 'La location doit contenir au moins un élément ou un groupe' },
        { status: 400 }
      );
    }

    // Validate rental items
    for (const item of rentalItems) {
      if (item.itemType === RENTAL_ITEM_TYPE.DEVICE && !item.deviceData) {
        return NextResponse.json(
          { message: 'Les données de l\'appareil sont requises pour les éléments de type DEVICE' },
          { status: 400 }
        );
      }
      if (item.itemType === RENTAL_ITEM_TYPE.ACCESSORY && !item.accessoryData) {
        return NextResponse.json(
          { message: 'Les données de l\'accessoire sont requises pour les éléments de type ACCESSORY' },
          { status: 400 }
        );
      }
      // Only require payments for items with totalPrice > 0 (exclude free items)
      if (item.totalPrice > 0 && (!item.payments || item.payments.length === 0)) {
        return NextResponse.json(
          { message: 'Chaque élément de location payant doit avoir au moins un paiement' },
          { status: 400 }
        );
      }
    }

    // Validate rental groups
    for (const group of rentalGroups) {
      if (!group.name || group.totalPrice <= 0) {
        return NextResponse.json(
          { message: 'Chaque groupe doit avoir un nom et un prix total supérieur à 0' },
          { status: 400 }
        );
      }
      
      // Validate that group has payments (either shared or individual item payments) for paid items
      const hasSharedPayments = group.sharedPayments && group.sharedPayments.length > 0;
      const hasItemPayments = group.items.some(item => 
        item.totalPrice > 0 && item.payments && item.payments.length > 0
      );
      const hasPaidItems = group.items.some(item => item.totalPrice > 0);
      
      // Only require payments if group has paid items
      if (hasPaidItems && !hasSharedPayments && !hasItemPayments) {
        return NextResponse.json(
          { message: 'Chaque groupe contenant des éléments payants doit avoir au moins un paiement partagé ou des paiements individuels' },
          { status: 400 }
        );
      }
    }

    // Calculate total amount from all payments
    const itemsPaymentAmount = rentalItems.reduce((total: number, item: RentalItemData) => {
      return total + item.payments.reduce((itemTotal: number, payment: PaymentData) => itemTotal + payment.amount, 0);
    }, 0);

    const groupsPaymentAmount = rentalGroups.reduce((total: number, group: RentalGroupData) => {
      const itemPayments = group.items.reduce((itemTotal: number, item: RentalItemData) => {
        return itemTotal + item.payments.reduce((paymentTotal: number, payment: PaymentData) => paymentTotal + payment.amount, 0);
      }, 0);
      const sharedPayments = group.sharedPayments.reduce((sharedTotal: number, payment: PaymentData) => sharedTotal + payment.amount, 0);
      return total + itemPayments + sharedPayments;
    }, 0);

    const totalPaymentAmount = itemsPaymentAmount + groupsPaymentAmount;

    if (Math.abs(totalPaymentAmount - amount) > 0.01) {
      return NextResponse.json(
        { message: 'Le montant total des paiements doit être égal au montant de la location' },
        { status: 400 }
      );
    }

    // Create the rental with all related data in a transaction
    const rental = await prisma.$transaction(async (tx) => {
      // Create the rental with creator information
      const createdRental = await tx.rental.create({
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          amount: amount,
          status: status || TRANSACTION_STATUS.PENDING,
          returnStatus: returnStatus as RETURN_STATUS || RETURN_STATUS.NOT_RETURNED,
          type: (rentalItems[0]?.payments[0]?.method || rentalGroups[0]?.sharedPayments[0]?.method) || SALETYPE.CASH,
          patient: {
            connect: { id: patientId }
          },
          notes: notes || '',
          createdBy: currentUser ? { connect: { id: currentUser.id } } : undefined,
        },
      });

      // Helper function to calculate overdue information
      const calculateOverdueInfo = (payment: PaymentData) => {
        const today = new Date();
        let dueDate = payment.dueDate ? new Date(payment.dueDate) : null;
        let overdueDate = payment.overdueDate ? new Date(payment.overdueDate) : null;
        
        // If no due date provided, use period end date or payment date + 30 days
        if (!dueDate) {
          if (payment.periodEndDate) {
            dueDate = new Date(payment.periodEndDate);
          } else if (payment.paymentDate) {
            dueDate = new Date(payment.paymentDate);
            dueDate.setDate(dueDate.getDate() + 30);
          } else {
            dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
          }
        }
        
        // Calculate overdue date (typically 7 days after due date)
        if (!overdueDate) {
          overdueDate = new Date(dueDate);
          overdueDate.setDate(overdueDate.getDate() + 7);
        }
        
        // Calculate if payment is overdue and days overdue
        const isOverdue = today > overdueDate;
        const overdueDays = isOverdue ? Math.floor((today.getTime() - overdueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        return {
          dueDate,
          overdueDate,
          isOverdue,
          overdueDays,
          reminderSent: payment.reminderSent || false
        };
      };

      // Helper function to create payment with overdue tracking
      const createPaymentWithOverdueTracking = async (payment: PaymentData, rentalId: string, rentalItemId?: string, rentalGroupId?: string) => {
        const overdueInfo = calculateOverdueInfo(payment);
        
        return await tx.payment.create({
          data: {
            amount: payment.amount,
            type: payment.method,
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
            periodStartDate: payment.periodStartDate ? new Date(payment.periodStartDate) : undefined,
            periodEndDate: payment.periodEndDate ? new Date(payment.periodEndDate) : undefined,
            dueDate: overdueInfo.dueDate,
            overdueDate: overdueInfo.overdueDate,
            isOverdue: overdueInfo.isOverdue,
            overdueDays: overdueInfo.overdueDays,
            reminderSent: overdueInfo.reminderSent,
            chequeNumber: payment.chequeNumber,
            chequeDate: payment.chequeDate ? new Date(payment.chequeDate) : undefined,
            traiteDueDate: payment.traiteDueDate ? new Date(payment.traiteDueDate) : undefined,
            cnamStatus: payment.cnamStatus,
            cnamFollowupDate: payment.cnamFollowupDate ? new Date(payment.cnamFollowupDate) : undefined,
            notes: payment.notes,
            rental: { connect: { id: rentalId } },
            rentalItem: rentalItemId ? { connect: { id: rentalItemId } } : undefined,
            rentalGroup: rentalGroupId ? { connect: { id: rentalGroupId } } : undefined,
          }
        });
      };

      // Create rental groups first
      for (const groupData of rentalGroups) {
        const rentalGroup = await tx.rentalGroup.create({
          data: {
            name: groupData.name,
            description: groupData.description,
            totalPrice: groupData.totalPrice,
            startDate: new Date(groupData.startDate),
            endDate: new Date(groupData.endDate),
            notes: groupData.notes,
            rental: { connect: { id: createdRental.id } }
          }
        });

        // Create items within the group
        for (const itemData of groupData.items) {
          let deviceId: string | undefined;
          let accessoryId: string | undefined;

          // Create device if it's a device item
          if (itemData.itemType === RENTAL_ITEM_TYPE.DEVICE && itemData.deviceData) {
            const device = await tx.device.create({
              data: {
                name: itemData.deviceData.name,
                model: itemData.deviceData.model,
                serialNumber: itemData.deviceData.serialNumber,
                rental: { connect: { id: createdRental.id } }
              }
            });
            deviceId = device.id;
          }

          // Create accessory if it's an accessory item
          if (itemData.itemType === RENTAL_ITEM_TYPE.ACCESSORY && itemData.accessoryData) {
            const accessory = await tx.accessory.create({
              data: {
                name: itemData.accessoryData.name,
                model: itemData.accessoryData.model,
                quantity: itemData.quantity,
                rental: { connect: { id: createdRental.id } }
              }
            });
            accessoryId = accessory.id;
          }

          // Create rental item within the group
          const rentalItem = await tx.rentalItem.create({
            data: {
              itemType: itemData.itemType,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              totalPrice: itemData.totalPrice,
              startDate: new Date(itemData.startDate),
              endDate: new Date(itemData.endDate),
              notes: itemData.notes,
              rental: { connect: { id: createdRental.id } },
              rentalGroup: { connect: { id: rentalGroup.id } },
              device: deviceId ? { connect: { id: deviceId } } : undefined,
              accessory: accessoryId ? { connect: { id: accessoryId } } : undefined,
            }
          });

          // Create payments for this rental item
          for (const payment of itemData.payments) {
            await createPaymentWithOverdueTracking(payment, createdRental.id, rentalItem.id, rentalGroup.id);
          }
        }

        // Create shared payments for the group
        for (const payment of groupData.sharedPayments) {
          await createPaymentWithOverdueTracking(payment, createdRental.id, undefined, rentalGroup.id);
        }
      }

      // Create individual rental items (not in groups)
      for (const itemData of rentalItems) {
        let deviceId: string | undefined;
        let accessoryId: string | undefined;

        // Create device if it's a device item
        if (itemData.itemType === RENTAL_ITEM_TYPE.DEVICE && itemData.deviceData) {
          const device = await tx.device.create({
            data: {
              name: itemData.deviceData.name,
              model: itemData.deviceData.model,
              serialNumber: itemData.deviceData.serialNumber,
              rental: { connect: { id: createdRental.id } }
            }
          });
          deviceId = device.id;
        }

        // Create accessory if it's an accessory item
        if (itemData.itemType === RENTAL_ITEM_TYPE.ACCESSORY && itemData.accessoryData) {
          const accessory = await tx.accessory.create({
            data: {
              name: itemData.accessoryData.name,
              model: itemData.accessoryData.model,
              quantity: itemData.quantity,
              rental: { connect: { id: createdRental.id } }
            }
          });
          accessoryId = accessory.id;
        }

        // Create rental item
        const rentalItem = await tx.rentalItem.create({
          data: {
            itemType: itemData.itemType,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            totalPrice: itemData.totalPrice,
            startDate: new Date(itemData.startDate),
            endDate: new Date(itemData.endDate),
            notes: itemData.notes,
            rental: { connect: { id: createdRental.id } },
            device: deviceId ? { connect: { id: deviceId } } : undefined,
            accessory: accessoryId ? { connect: { id: accessoryId } } : undefined,
          }
        });

        // Create payments for this rental item
        for (const payment of itemData.payments) {
          await createPaymentWithOverdueTracking(payment, createdRental.id, rentalItem.id);
        }
      }

      return createdRental;
    });

    // Fetch the complete rental with related data
    const completeRental = await prisma.rental.findUnique({
      where: { id: rental.id },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            region: true,
            address: true,
            doctorName: true,
            technician: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            },
            supervisor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        },
        devices: true,
        accessories: true,
        payments: {
          orderBy: { paymentDate: 'asc' }
        },
        rentalItems: {
          include: {
            device: true,
            accessory: true,
            payments: {
              orderBy: { paymentDate: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: completeRental
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création de la location', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Authentication requise' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status') as RETURN_STATUS | null;
    const includeOutstanding = searchParams.get('includeOutstanding') === 'true';
    
    // If requesting outstanding balances for a specific patient
    if (includeOutstanding && patientId) {
      const outstandingBalances = await getOutstandingBalances(patientId);
      return NextResponse.json(outstandingBalances);
    }
    
    interface WhereClause {
      patientId?: string;
      returnStatus?: RETURN_STATUS;
      patient?: {
        technicianId?: string;
      };
    }

    const where: WhereClause = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      where.returnStatus = status;
    }

    // Filter by technician for employee users
    if (currentUser?.role === 'EMPLOYEE') {
      where.patient = { technicianId: currentUser.id };
    }
    
    const rentals = await prisma.rental.findMany({
      where: where,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            region: true,
            address: true,
            doctorName: true,
            technician: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            },
            supervisor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        devices: true,
        accessories: true,
        payments: {
          orderBy: { paymentDate: 'asc' }
        },
        rentalItems: {
          include: {
            device: true,
            accessory: true,
            payments: {
              orderBy: { paymentDate: 'asc' }
            }
          }
        },
        rentalGroups: {
          include: {
            rentalItems: {
              include: {
                device: true,
                accessory: true,
                payments: {
                  orderBy: { paymentDate: 'asc' }
                }
              }
            },
            payments: {
              orderBy: { paymentDate: 'asc' }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' },
    });
    
    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des locations' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, returnDate, returnStatus, notes, extendEndDate } = body;

    if (!id || !returnStatus) {
      return NextResponse.json(
        { message: 'L\'identifiant de location et le statut de retour sont requis' },
        { status: 400 }
      );
    }

    // Handle rental extension
    if (extendEndDate) {
      const rental = await prisma.rental.update({
        where: { id },
        data: {
          endDate: new Date(extendEndDate),
          notes: notes || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Location étendue avec succès',
        data: rental
      });
    }

    // Handle return status update
    const rental = await prisma.rental.update({
      where: { id },
      data: {
        actualReturnDate: returnDate ? new Date(returnDate) : undefined,
        returnStatus: returnStatus as RETURN_STATUS,
        notes: notes || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Statut de retour mis à jour avec succès',
      data: rental
    });
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la mise à jour de la location' },
      { status: 500 }
    );
  }
}