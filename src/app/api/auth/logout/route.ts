import { NextResponse } from 'next/server';
// No need to import cookies since we're using headers directly

export async function POST() {
  try {
    // We can't directly delete cookies in route handlers
    // Instead, we'll return a response with Set-Cookie header to expire the cookie
    
    // Return success response
    return NextResponse.json(
      { message: 'Déconnexion réussie' },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
        }
      }
    );
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
