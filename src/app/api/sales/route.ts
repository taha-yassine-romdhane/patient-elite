import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TRANSACTION_STATUS, SALETYPE } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

// Device data structure for API request
type DeviceData = {
  name: string;
  model: string;
  serialNumber: string;
  quantity: number;
};

// Accessory data structure for API request
type AccessoryData = {
  name: string;
  model: string;
  quantity: number;
};

// Payment data structure
type PaymentData = {
  method: SALETYPE;
  amount: number;
  paymentDate?: string;
  chequeNumber?: string;
  chequeDate?: string;
  traiteDueDate?: string;
  notes?: string;
};

// Sale request data structure
type SaleRequestData = {
  patientId: string;
  date: string;
  amount: number;
  status: TRANSACTION_STATUS;
  notes?: string;
  devices: DeviceData[];
  accessories: AccessoryData[];
  payments: PaymentData[];
};

export async function POST(request: Request) {
  try {
    // Get current user for creator tracking
    const currentUser = await getCurrentUser(request);
    
    const body = await request.json() as SaleRequestData;
    const { patientId, date, amount, status, notes, devices, accessories, payments } = body;

    // Validate required fields
    if (!patientId || !date || amount === undefined) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validate that at least one device or accessory is included
    if ((!devices || devices.length === 0) && (!accessories || accessories.length === 0)) {
      return NextResponse.json(
        { message: 'La vente doit contenir au moins un appareil ou un accessoire' },
        { status: 400 }
      );
    }

    // Validate that at least one payment is included
    if (!payments || payments.length === 0) {
      return NextResponse.json(
        { message: 'La vente doit contenir au moins un paiement' },
        { status: 400 }
      );
    }

    // Validate that payment amounts sum to the total amount
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (Math.abs(totalPayments - amount) > 0.01) { // Allow small floating point differences
      return NextResponse.json(
        { message: 'Le montant total des paiements ne correspond pas au montant de la vente' },
        { status: 400 }
      );
    }

    // Create the sale with all related data
    const sale = await prisma.sale.create({
      data: {
        date: new Date(date),
        amount: amount,
        status: status || TRANSACTION_STATUS.PENDING,
        notes: notes,
        patient: {
          connect: { id: patientId }
        },
        createdBy: currentUser ? { connect: { id: currentUser.id } } : undefined,
        // Create devices if any
        devices: devices && devices.length > 0 ? {
          create: devices.map(device => ({
            name: device.name,
            model: device.model,
            serialNumber: device.serialNumber,
            price: 0 // You might want to add price to DeviceData type
          }))
        } : undefined,
        // Create accessories if any
        accessories: accessories && accessories.length > 0 ? {
          create: accessories.map(accessory => ({
            name: accessory.name,
            model: accessory.model,
            quantity: accessory.quantity,
            price: 0 // You might want to add price to AccessoryData type
          }))
        } : undefined,
        // Create payments
        payments: {
          create: payments.map(payment => ({
            amount: payment.amount,
            type: payment.method,
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
            chequeNumber: payment.chequeNumber,
            chequeDate: payment.chequeDate ? new Date(payment.chequeDate) : null,
            traiteDueDate: payment.traiteDueDate ? new Date(payment.traiteDueDate) : null,
            notes: payment.notes
          }))
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            region: true,
            address: true,
            doctorName: true
          }
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
        payments: true
      }
    });

    return NextResponse.json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création de la vente', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get current user for filtering
    const currentUser = await getCurrentUser(request);
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    const where: { patientId?: string; patient?: { technicianId?: string } } = {};
    if (patientId) {
      where.patientId = patientId;
    }
    
    // Filter by technician for employee users
    if (currentUser?.role === 'EMPLOYEE') {
      where.patient = { technicianId: currentUser.id };
    }
    
    const sales = await prisma.sale.findMany({
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
            diagnostics: {
              orderBy: {
                date: 'desc'
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
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: { date: 'desc' },
    });
    
    // Add latest diagnostic to each sale's patient data
    const salesWithLatestDiagnostic = sales.map(sale => ({
      ...sale,
      patient: sale.patient ? {
        ...sale.patient,
        latestDiagnostic: sale.patient.diagnostics && sale.patient.diagnostics.length > 0 
          ? sale.patient.diagnostics[0] 
          : null
      } : null
    }));
    
    return NextResponse.json(salesWithLatestDiagnostic);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des ventes' },
      { status: 500 }
    );
  }
}
