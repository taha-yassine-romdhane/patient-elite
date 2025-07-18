import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/sessionAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Token manquant' },
        { status: 401 }
      );
    }

    // Validate session from database
    const session = await validateSession(token);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session invalide ou expirée' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
