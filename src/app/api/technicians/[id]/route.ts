import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, phone, specialization, status } = body;

    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id },
    });

    if (!existingTechnician) {
      return NextResponse.json(
        { message: 'Technicien non trouvé' },
        { status: 404 }
      );
    }

    // Check if email is already used by another technician
    if (email !== existingTechnician.email) {
      const emailExists = await prisma.technician.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'Un technicien avec cet email existe déjà' },
          { status: 400 }
        );
      }
    }

    // Update technician
    const updatedTechnician = await prisma.technician.update({
      where: { id },
      data: {
        name,
        email,
        role: role || 'EMPLOYEE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Add additional fields for response
    const technicianResponse = {
      ...updatedTechnician,
      phone: phone || '',
      specialization: specialization || '',
      status: status || 'ACTIVE',
    };

    return NextResponse.json(technicianResponse);
  } catch (error) {
    console.error('Error updating technician:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du technicien' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    // Check if technician exists
    const technician = await prisma.technician.findUnique({
      where: { id },
    });

    if (!technician) {
      return NextResponse.json(
        { message: 'Technicien non trouvé' },
        { status: 404 }
      );
    }

    // Delete the technician
    await prisma.technician.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Technicien supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting technician:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du technicien' },
      { status: 500 }
    );
  }
} 