import { NextResponse } from 'next/server';
import { createLogoutResponse } from '@/lib/cookieAuth';

export async function POST() {
  try {
    // Clear secure authentication cookie
    return createLogoutResponse();
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
