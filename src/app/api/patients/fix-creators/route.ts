import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Get the first admin user to assign as creator for existing patients
    const firstAdmin = await prisma.technician.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!firstAdmin) {
      return NextResponse.json(
        { message: 'No admin user found' },
        { status: 404 }
      );
    }
    
    // Find all patients without a creator
    const patientsWithoutCreator = await prisma.patient.findMany({
      where: { createdById: null },
      select: { id: true, fullName: true }
    });
    
    console.log(`Found ${patientsWithoutCreator.length} patients without creator`);
    
    // Update all patients without creator to be created by the first admin
    const updateResult = await prisma.patient.updateMany({
      where: { createdById: null },
      data: { createdById: firstAdmin.id }
    });
    
    console.log(`Updated ${updateResult.count} patients`);
    
    return NextResponse.json({
      message: `Successfully assigned ${updateResult.count} patients to ${firstAdmin.name}`,
      updatedCount: updateResult.count,
      assignedTo: {
        id: firstAdmin.id,
        name: firstAdmin.name,
        email: firstAdmin.email
      }
    });
    
  } catch (error) {
    console.error('Error fixing patient creators:', error);
    return NextResponse.json(
      { message: 'Error fixing patient creators' },
      { status: 500 }
    );
  }
} 