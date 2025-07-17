import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Note: bcryptjs needs to be installed: npm install bcryptjs @types/bcryptjs
// For now, using a simple hash - should be replaced with proper bcrypt
const simpleHash = (password: string) => {
  // This is a placeholder - in production, use proper bcrypt
  return Buffer.from(password).toString('base64');
};

export async function GET() {
  try {
    const technicians = await prisma.technician.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add additional fields that might not be in the schema yet
    const techniciansList = technicians.map(tech => ({
      ...tech,
      phone: '', // Default empty since not in schema
      specialization: '', // Default empty since not in schema
      status: 'ACTIVE', // Default active status
    }));

    return NextResponse.json(techniciansList);
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des techniciens' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, phone, specialization, status } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Le nom et l\'email sont requis' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { email },
    });

    if (existingTechnician) {
      return NextResponse.json(
        { message: 'Un technicien avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Generate a default password (should be changed by user)
    const defaultPassword = 'password123';
    const hashedPassword = simpleHash(defaultPassword);

    // Create new technician
    const technician = await prisma.technician.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
      ...technician,
      phone: phone || '',
      specialization: specialization || '',
      status: status || 'ACTIVE',
    };

    return NextResponse.json(technicianResponse);
  } catch (error) {
    console.error('Error creating technician:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du technicien' },
      { status: 500 }
    );
  }
}
