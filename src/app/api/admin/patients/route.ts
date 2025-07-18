import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/apiAuth';

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Authentication requise' },
        { status: 401 }
      );
    }
    
    const currentUser = session.user;

    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    const where: {
      OR?: Array<{
        fullName?: { contains: string; mode: 'insensitive' };
        phone?: { contains: string };
        region?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { region: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const patients = await prisma.patient.findMany({
      where: where,
      orderBy: { fullName: 'asc' },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients for admin:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching patients for admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Authentication requise' },
        { status: 401 }
      );
    }
    
    const currentUser = session.user;

    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');

    if (!patientId) {
      return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 });
    }

    // Use a transaction to ensure all related data is deleted before the patient is deleted
    await prisma.$transaction(async (tx) => {
      // Find all related records
      const sales = await tx.sale.findMany({ where: { patientId } });
      const rentals = await tx.rental.findMany({ where: { patientId } });

      for (const sale of sales) {
        await tx.payment.deleteMany({ where: { saleId: sale.id } });
        await tx.device.deleteMany({ where: { saleId: sale.id } });
        await tx.accessory.deleteMany({ where: { saleId: sale.id } });
      }

      for (const rental of rentals) {
        await tx.payment.deleteMany({ where: { rentalId: rental.id } });
        await tx.device.deleteMany({ where: { rentalId: rental.id } });
        await tx.accessory.deleteMany({ where: { rentalId: rental.id } });
        await tx.rentalItem.deleteMany({ where: { rentalId: rental.id } });
        await tx.rentalGroup.deleteMany({ where: { rentalId: rental.id } });
      }

      // Delete the top-level related records
      await tx.diagnostic.deleteMany({ where: { patientId } });
      await tx.sale.deleteMany({ where: { patientId } });
      await tx.rental.deleteMany({ where: { patientId } });

      // Finally, delete the patient
      await tx.patient.delete({ where: { id: patientId } });
    });

    return NextResponse.json({ message: 'Patient and all related data deleted successfully' });

  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the patient' },
      { status: 500 }
    );
  }
}
