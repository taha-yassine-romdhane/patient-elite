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

// Simple rental form data structure
type SimpleRentalFormData = {
  patientId: string;
  startDate: string;
  endDate?: string | null;
  contractNumber: string;
  notes?: string;
  amount: number;
  type: SALETYPE;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  returnStatus: 'NOT_RETURNED' | 'RETURNED' | 'PARTIALLY_RETURNED' | 'DAMAGED';
  actualReturnDate?: string;
  devices: {
    name: string;
    model: string;
    serialNumber: string;
    notes?: string;
  }[];
  accessories: {
    name: string;
    model: string;
    isFree: boolean;
    notes?: string;
  }[];
  payments: {
    type: SALETYPE;
    amount: number;
    dueDate?: string;
    cnamStatus?: string;
    cnamSupportAmount?: number;
    cnamDebutDate?: string;
    cnamEndDate?: string;
    cnamSupportMonths?: number;
    // Cash payment specific fields
    cashTotal?: number;
    cashAcompte?: number;
    cashRest?: number;
    cashRestDate?: string;
    notes?: string;
    alerts?: {
      date: string;
      note?: string;
    }[];
  }[];
};

// Legacy complex rental request data structure (for backward compatibility)
type RentalRequestData = {
  patientId: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: TRANSACTION_STATUS;
  returnStatus: RETURN_STATUS;
  notes?: string;
  rentalItems: RentalItemData[];
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
    
    const body = await request.json();
    
    // Check if it's the simple rental form data (has contractNumber and devices/accessories arrays)
    if ('contractNumber' in body && 'devices' in body && 'accessories' in body) {
      return handleSimpleRentalForm(body as SimpleRentalFormData, currentUser);
    }
    
    // Legacy complex rental handling
    return handleComplexRental(body as RentalRequestData, currentUser);
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création de la location', error: String(error) },
      { status: 500 }
    );
  }
}

// Handle simple rental form submission
async function handleSimpleRentalForm(body: SimpleRentalFormData, currentUser: any) {
  const { 
    patientId, 
    startDate, 
    endDate, 
    contractNumber,
    notes,
    amount,
    type,
    status,
    returnStatus,
    actualReturnDate,
    devices,
    accessories,
    payments
  } = body;

  // Validate required fields
  if (!patientId || !startDate || !contractNumber || amount === undefined) {
    return NextResponse.json(
      { message: 'Tous les champs obligatoires doivent être remplis' },
      { status: 400 }
    );
  }

  // Validate that at least one device or accessory is included
  if (devices.length === 0 && accessories.length === 0) {
    return NextResponse.json(
      { message: 'La location doit contenir au moins un appareil ou accessoire' },
      { status: 400 }
    );
  }

  // Validate payments
  if (payments.length === 0) {
    return NextResponse.json(
      { message: 'Au moins un paiement doit être défini' },
      { status: 400 }
    );
  }

  const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  if (Math.abs(totalPaymentAmount - amount) > 0.01) {
    return NextResponse.json(
      { message: 'Le montant total des paiements doit être égal au montant de la location' },
      { status: 400 }
    );
  }

  // Create the rental with simplified structure
  const rental = await prisma.$transaction(async (tx) => {
    // Create the rental data object
    const rentalData: any = {
      startDate: new Date(startDate),
      amount: amount,
      contractNumber: contractNumber,
      status: status as TRANSACTION_STATUS,
      returnStatus: returnStatus as RETURN_STATUS,
      actualReturnDate: actualReturnDate ? new Date(actualReturnDate) : null,
      type: type,
      patient: {
        connect: { id: patientId }
      },
      notes: notes || '',
      createdBy: { connect: { id: currentUser.id } },
    };

    // Only add endDate if it's provided
    if (endDate) {
      rentalData.endDate = new Date(endDate);
    }

    const createdRental = await tx.rental.create({
      data: rentalData,
    });

    // Create devices and rental items
    for (const deviceData of devices) {
      if (deviceData.name.trim()) {
        // Create device
        const device = await tx.device.create({
          data: {
            name: deviceData.name,
            model: deviceData.model,
            serialNumber: deviceData.serialNumber,
            notes: deviceData.notes,
            rental: { connect: { id: createdRental.id } }
          }
        });

        // Create rental item for device
        const deviceRentalItemData: any = {
          itemType: 'DEVICE',
          quantity: 1,
          unitPrice: 0, // Simple rentals don't track individual item prices
          totalPrice: 0,
          startDate: new Date(startDate),
          notes: deviceData.notes,
          rental: { connect: { id: createdRental.id } },
          device: { connect: { id: device.id } }
        };

        // Only add endDate if provided
        if (endDate) {
          deviceRentalItemData.endDate = new Date(endDate);
        }

        await tx.rentalItem.create({
          data: deviceRentalItemData
        });
      }
    }

    // Create accessories and rental items
    for (const accessoryData of accessories) {
      if (accessoryData.name.trim()) {
        // Create accessory
        const accessory = await tx.accessory.create({
          data: {
            name: accessoryData.name,
            model: accessoryData.model,
            quantity: 1, // Default quantity
            price: accessoryData.isFree ? 0 : 100, // Default price for paid accessories
            notes: accessoryData.notes,
            rental: { connect: { id: createdRental.id } }
          }
        });

        // Create rental item for accessory
        const accessoryRentalItemData: any = {
          itemType: 'ACCESSORY',
          quantity: 1,
          unitPrice: accessoryData.isFree ? 0 : 100,
          totalPrice: accessoryData.isFree ? 0 : 100,
          startDate: new Date(startDate),
          notes: accessoryData.notes,
          rental: { connect: { id: createdRental.id } },
          accessory: { connect: { id: accessory.id } }
        };

        // Only add endDate if provided
        if (endDate) {
          accessoryRentalItemData.endDate = new Date(endDate);
        }

        await tx.rentalItem.create({
          data: accessoryRentalItemData
        });
      }
    }

    // Create payments
    for (const paymentData of payments) {
      const createdPayment = await tx.payment.create({
        data: {
          amount: paymentData.amount,
          type: paymentData.type,
          paymentDate: new Date(),
          dueDate: paymentData.dueDate ? new Date(paymentData.dueDate) : new Date(),
          cnamStatus: paymentData.cnamStatus,
          cnamSupportAmount: paymentData.cnamSupportAmount,
          cnamDebutDate: paymentData.cnamDebutDate ? new Date(paymentData.cnamDebutDate) : undefined,
          cnamEndDate: paymentData.cnamEndDate ? new Date(paymentData.cnamEndDate) : undefined,
          cnamSupportMonths: paymentData.cnamSupportMonths,
          // Cash payment specific fields
          cashTotal: paymentData.cashTotal,
          cashAcompte: paymentData.cashAcompte,
          cashRest: paymentData.cashRest,
          cashRestDate: paymentData.cashRestDate ? new Date(paymentData.cashRestDate) : undefined,
          notes: paymentData.notes,
          rental: { connect: { id: createdRental.id } },
        }
      });

      // Create payment alerts if any
      if (paymentData.alerts && paymentData.alerts.length > 0) {
        for (const alertData of paymentData.alerts) {
          if (alertData.date && alertData.note) {
            await tx.paymentAlert.create({
              data: {
                date: new Date(alertData.date),
                note: alertData.note,
                payment: { connect: { id: createdPayment.id } },
              }
            });
          }
        }
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
        }
      },
      devices: true,
      accessories: true,
      payments: {
        include: {
          alerts: true
        },
        orderBy: { paymentDate: 'asc' }
      }
    }
  });

  return NextResponse.json({
    success: true,
    data: completeRental
  });
}

// Handle complex legacy rental (keep existing logic)
async function handleComplexRental(body: RentalRequestData, currentUser: any) {
  try {
    const { 
      patientId, 
      startDate, 
      endDate, 
      amount, 
      status, 
      returnStatus, 
      notes,
      rentalItems = []
    } = body;

    // Validate required fields
    if (!patientId || !startDate || !endDate || amount === undefined) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validate that at least one rental item is included
    if (rentalItems.length === 0) {
      return NextResponse.json(
        { message: 'La location doit contenir au moins un élément' },
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


    // Calculate total amount from all payments
    const totalPaymentAmount = rentalItems.reduce((total: number, item: RentalItemData) => {
      return total + item.payments.reduce((itemTotal: number, payment: PaymentData) => itemTotal + payment.amount, 0);
    }, 0);

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
          type: rentalItems[0]?.payments[0]?.method || SALETYPE.CASH,
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
      const createPaymentWithOverdueTracking = async (payment: PaymentData, rentalId: string, rentalItemId?: string) => {
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
          }
        });
      };


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
          include: {
            alerts: true
          },
          orderBy: { paymentDate: 'asc' }
        },
        rentalItems: {
          include: {
            device: true,
            accessory: true,
            payments: {
              include: {
                alerts: true
              },
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
          include: {
            alerts: true
          },
          orderBy: { paymentDate: 'asc' }
        },
        rentalItems: {
          include: {
            device: true,
            accessory: true,
            payments: {
              include: {
                alerts: true
              },
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