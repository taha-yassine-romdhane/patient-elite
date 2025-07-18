import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { handleCorsOptions, createCorsResponse } from '@/lib/cors';

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createCorsResponse(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Find technician by email
    const technician = await prisma.technician.findFirst({
      where: { email: email },
    });

    if (!technician) {
      return createCorsResponse(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, technician.password);

    if (!passwordMatch) {
      return createCorsResponse(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: technician.id,
        email: technician.email,
        role: technician.role,
        name: technician.name,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Return token in response body instead of setting a cookie
    return createCorsResponse({
      message: 'Connexion réussie',
      user: {
        id: technician.id,
        email: technician.email,
        name: technician.name,
        role: technician.role,
      },
      role: technician.role,
      token: token, // Include token in response body
    });
  } catch (error) {
    console.error('Login error:', error);
    return createCorsResponse(
      { message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
