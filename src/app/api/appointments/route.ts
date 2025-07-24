import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APPOINTMENT_TYPE, APPOINTMENT_STATUS } from '@prisma/client';
import { getCurrentUser } from '@/lib/nextauth-server';

// Appointment request data structure
type AppointmentRequestData = {
  patientId: string;
  appointmentDate: string;
  type: APPOINTMENT_TYPE;
  notes?: string;
  // Optional relations
  rentalId?: string;
  saleId?: string;
  diagnosticId?: number;
};

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
    
    const body = await request.json() as AppointmentRequestData;
    
    const { 
      patientId, 
      appointmentDate, 
      type, 
      notes,
      rentalId,
      saleId,
      diagnosticId
    } = body;

    // Validate required fields
    if (!patientId || !appointmentDate || !type) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validate appointment date is in the future
    const appointmentDateTime = new Date(appointmentDate);
    if (appointmentDateTime <= new Date()) {
      return NextResponse.json(
        { message: 'Le rendez-vous doit être planifié dans le futur' },
        { status: 400 }
      );
    }

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        appointmentDate: appointmentDateTime,
        type: type,
        status: APPOINTMENT_STATUS.SCHEDULED,
        notes: notes?.trim() || null,
        patient: {
          connect: { id: patientId }
        },
        // Optional relations
        rental: rentalId ? { connect: { id: rentalId } } : undefined,
        sale: saleId ? { connect: { id: saleId } } : undefined,
        diagnostic: diagnosticId ? { connect: { id: diagnosticId } } : undefined,
        createdBy: { connect: { id: currentUser.id } },
      },
    });

    // Fetch the complete appointment with related data
    const completeAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
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
        rental: {
          select: {
            id: true,
            contractNumber: true,
            startDate: true,
            endDate: true,
          }
        },
        sale: {
          select: {
            id: true,
            date: true,
            amount: true,
          }
        },
        diagnostic: {
          select: {
            id: true,
            date: true,
            polygraph: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: completeAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du rendez-vous', error: String(error) },
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
    const status = searchParams.get('status') as APPOINTMENT_STATUS | null;
    const type = searchParams.get('type') as APPOINTMENT_TYPE | null;
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    interface WhereClause {
      patientId?: string;
      status?: APPOINTMENT_STATUS;
      type?: APPOINTMENT_TYPE;
      appointmentDate?: {
        gte?: Date;
        lte?: Date;
      };
      patient?: {
        technicianId?: string;
      };
    }

    const where: WhereClause = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Date range filter
    if (fromDate || toDate) {
      where.appointmentDate = {};
      if (fromDate) {
        where.appointmentDate.gte = new Date(fromDate);
      }
      if (toDate) {
        where.appointmentDate.lte = new Date(toDate);
      }
    }

    // Filter by technician for employee users
    if (currentUser?.role === 'EMPLOYEE') {
      where.patient = { technicianId: currentUser.id };
    }
    
    const appointments = await prisma.appointment.findMany({
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
          }
        },
        rental: {
          select: {
            id: true,
            contractNumber: true,
            startDate: true,
            endDate: true,
          }
        },
        sale: {
          select: {
            id: true,
            date: true,
            amount: true,
          }
        },
        diagnostic: {
          select: {
            id: true,
            date: true,
            polygraph: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { appointmentDate: 'asc' },
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { id, status, appointmentDate, notes, type } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'L\'identifiant du rendez-vous est requis' },
        { status: 400 }
      );
    }

    // Update the appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || undefined,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        notes: notes !== undefined ? notes?.trim() || null : undefined,
        type: type || undefined,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous mis à jour avec succès',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la mise à jour du rendez-vous' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'L\'identifiant du rendez-vous est requis' },
        { status: 400 }
      );
    }

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la suppression du rendez-vous' },
      { status: 500 }
    );
  }
}