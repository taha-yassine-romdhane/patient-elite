import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (currentUser?.role !== 'ADMIN') {
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
