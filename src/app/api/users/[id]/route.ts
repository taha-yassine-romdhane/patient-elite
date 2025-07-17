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
    const { name, email, role } = body;

    // Check if user exists
    const existingUser = await prisma.technician.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Check if email is already used by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.technician.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'Un utilisateur avec cet email existe déjà' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.technician.update({
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour de l'utilisateur" },
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

    // Check if user exists
    const user = await prisma.technician.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Delete the user
    await prisma.technician.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}