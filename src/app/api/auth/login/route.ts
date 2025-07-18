import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createAuthResponse } from '@/lib/cookieAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Find technician by email
    const technician = await prisma.technician.findFirst({
      where: { email: email },
    });

    if (!technician) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, technician.password);

    if (!passwordMatch) {
      return NextResponse.json(
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

    // Return response with secure cookie and user data
    console.log('Login successful, creating auth response with token');
    const response = createAuthResponse({
      message: 'Connexion réussie',
      user: {
        id: technician.id,
        email: technician.email,
        name: technician.name,
        role: technician.role,
      },
      role: technician.role,
    }, token);
    
    console.log('Response headers:', response.headers);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
