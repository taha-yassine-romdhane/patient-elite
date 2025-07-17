import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// PUT handler to update a patient by ID
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    // Await the params in Next.js 15
    const { id: patientId } = await params;
    
    if (!patientId) {
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
        cin: patientData.cin || null,
        hasCnam: patientData.hasCnam,
        cnamId: patientData.hasCnam ? patientData.cnamId : null,
        affiliation: patientData.hasCnam ? patientData.affiliation : null,
        beneficiary: patientData.hasCnam ? patientData.beneficiary : null,
        region: patientData.region,
        address: patientData.address || "",
        addressDetails: patientData.addressDetails || null,
        doctorName: patientData.doctorName || "",
        technicianId: patientData.technicianId || null,
        supervisorId: patientData.supervisorId || null
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

// GET handler to fetch a single patient by ID with all related data
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    // Await the params in Next.js 15
    const { id: patientId } = await params;
    
    if (!patientId) {
      return NextResponse.json(
        { message: "ID du patient manquant" },
        { status: 400 }
      );
    }
    
    // Fetch patient with all related data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        // Include technician and supervisor
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
        // Include diagnostics
        diagnostics: {
          orderBy: {
            date: 'desc'
          }
        },
        // Include sales with devices and accessories
        sales: {
          orderBy: {
            date: 'desc'
          },
          include: {
            devices: true,
            accessories: true
          }
        },
        // Include rentals with devices and accessories
        rentals: {
          orderBy: {
            startDate: 'desc'
          },
          include: {
            devices: true,
            accessories: true
          }
        }
      }
    });
    
    if (!patient) {
      return NextResponse.json(
        { message: "Patient non trouvé" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du patient", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a patient by ID
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    // Await the params in Next.js 15
    const { id: patientId } = await params;
    
    if (!patientId) {
      return NextResponse.json(
        { message: "ID du patient manquant" },
        { status: 400 }
      );
    }
    
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!patient) {
      return NextResponse.json(
        { message: "Patient non trouvé" },
        { status: 404 }
      );
    }
    
    // Delete the patient
    await prisma.patient.delete({
      where: { id: patientId }
    });
    
    return NextResponse.json(
      { message: "Patient supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du patient" },
      { status: 500 }
    );
  }
}