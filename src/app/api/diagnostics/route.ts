import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/apiAuth';

export async function POST(request: Request) {
  try {
    // Get current user from session
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Authentication requise' },
        { status: 401 }
      );
    }
    
    const currentUser = session.user;
    
    const body = await request.json();
    const { patientId, date, polygraph, iahResult, idResult, remarks } = body;

    // Validate required fields
    if (!patientId || !date || !polygraph || iahResult === undefined || idResult === undefined) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Create the diagnostic
    const diagnostic = await prisma.diagnostic.create({
      data: {
        date: new Date(date),
        polygraph,
        iahResult,
        idResult,
        remarks,
        patient: {
          connect: { id: patientId }
        },
        createdBy: {
          connect: { id: currentUser.id }
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            region: true,
            address: true,
            doctorName: true,
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
      },
    });

    return NextResponse.json({
      success: true,
      data: diagnostic
    });
  } catch (error) {
    console.error('Error creating diagnostic:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du diagnostic' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get current user from session
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Authentication requise' },
        { status: 401 }
      );
    }
    
    const currentUser = session.user;
    
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    const where: { patientId?: string; createdById?: string } = {};
    if (patientId) {
      where.patientId = patientId;
    }
    
    // Filter by creator for employee users
    if (currentUser.role === 'EMPLOYEE') {
      where.createdById = currentUser.id;
    }
    
    const diagnostics = await prisma.diagnostic.findMany({
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
                email: true
              }
            },
            supervisor: {
              select: {
                id: true,
                name: true,
                email: true
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
      },
      orderBy: { date: 'desc' },
    });
    
    return NextResponse.json(diagnostics);
  } catch (error) {
    console.error('Error fetching diagnostics:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des diagnostics' },
      { status: 500 }
    );
  }
}
