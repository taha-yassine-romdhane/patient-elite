import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/sessionAuth';

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      // Delete session from database
      await deleteSession(token);
    }

    // With localStorage, we don't need to clear cookies server-side
    // The client will handle clearing localStorage
    
    // Return success response
    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
