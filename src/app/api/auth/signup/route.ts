import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ROLE } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingTechnician = await prisma.technician.findFirst({
      where: { email },
    });

    if (existingTechnician) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new technician with specified role (default to EMPLOYEE if not provided)
    const userRole = role === 'ADMIN' ? ROLE.ADMIN : ROLE.EMPLOYEE;
    const technician = await prisma.technician.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Return success without sending the password
    return NextResponse.json({
      id: technician.id,
      name: technician.name,
      email: technician.email,
      role: technician.role,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}
