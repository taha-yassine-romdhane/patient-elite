import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/sessionAuth';

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

    // Get request metadata for session tracking
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || undefined;

    // Create session in database
    const sessionToken = await createSession(technician.id, userAgent, ipAddress);

    // Return session token and user data
    return NextResponse.json(
      {
        message: 'Connexion réussie',
        user: {
          id: technician.id,
          email: technician.email,
          name: technician.name,
          role: technician.role,
        },
        role: technician.role,
        token: sessionToken, // Session token from database
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
