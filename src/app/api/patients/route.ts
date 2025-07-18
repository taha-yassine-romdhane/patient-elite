import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/apiAuth';

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
    const search = searchParams.get('search') || '';
    const technicianId = searchParams.get('technicianId');
    
    // Build the where clause based on search parameters
    const where: {
      OR?: Array<{
        fullName?: { contains: string; mode: 'insensitive' };
        phone?: { contains: string };
        region?: { contains: string; mode: 'insensitive' };
      }>;
      technicianId?: string;
      createdById?: string;
    } = {};
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { region: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Filter by technician if provided
    if (technicianId) {
      where.technicianId = technicianId;
    }
    
    // Filter by creator for employee users
    if (currentUser.role === 'EMPLOYEE') {
      where.createdById = currentUser.id;
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
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des patients' },
      { status: 500 }
    );
  }
}

// PUT handler to update a patient by ID
export async function PUT(request: Request) {
  try {
    // Get patient ID from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const patientId = pathParts[pathParts.length - 1];
    
    if (!patientId || patientId === 'patients') {
      return NextResponse.json(
        { message: "ID du patient manquant" },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const patientData = await request.json();
    
    // Validate required fields
    if (!patientData.fullName || !patientData.phone || !patientData.region) {
      return NextResponse.json(
        { message: "Nom complet, téléphone et région sont obligatoires" },
        { status: 400 }
      );
    }
    
    // Update the patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        fullName: patientData.fullName,
        phone: patientData.phone,
        region: patientData.region,
        address: patientData.address || "",
        doctorName: patientData.doctorName || ""
      }
    });
    
    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du patient" },
      { status: 500 }
    );
  }
}

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
    
    // Get the patient data from the request body
    const patientData = await request.json();

    // Validate required fields
    if (!patientData.fullName || !patientData.phone || !patientData.region) {
      return NextResponse.json(
        { message: 'Nom complet, téléphone et région sont requis' },
        { status: 400 }
      );
    }

    // Create the patient data object
    const patientToCreate = {
      fullName: patientData.fullName,
      phone: patientData.phone,
      region: patientData.region,
      address: patientData.address || "",
      doctorName: patientData.doctorName || "",
      date: new Date(),
      cin: patientData.cin || null,
      hasCnam: patientData.hasCnam || false,
      cnamId: patientData.hasCnam ? patientData.cnamId : null,
      affiliation: patientData.hasCnam ? patientData.affiliation : null,
      beneficiary: patientData.hasCnam ? patientData.beneficiary : null,
      technicianId: patientData.technicianId || null,
      supervisorId: patientData.supervisorId || null,
      createdById: currentUser.id,
    };

    // Create the new patient
    const newPatient = await prisma.patient.create({
      data: patientToCreate,
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

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la création du patient' },
      { status: 500 }
    );
  }
}
