import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // With localStorage, we don't need to clear cookies server-side
    // The client will handle clearing localStorage
    
    // Return success response
    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
