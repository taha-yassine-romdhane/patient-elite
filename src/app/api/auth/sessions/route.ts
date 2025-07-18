import { NextResponse } from 'next/server';
import { validateSession, getUserSessions, deleteAllUserSessions, refreshSession } from '@/lib/sessionAuth';

// GET /api/auth/sessions - Get all active sessions for current user
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

    // Validate current session
    const session = await validateSession(token);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session invalide ou expirée' },
        { status: 401 }
      );
    }

    // Get all sessions for this user
    const sessions = await getUserSessions(session.userId);

    return NextResponse.json({
      sessions: sessions.map(s => ({
        id: s.id,
        token: s.token === token ? 'current' : 'other', // Hide other tokens
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        isCurrent: s.token === token,
      })),
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/sessions - Logout from all devices
export async function DELETE(request: Request) {
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

    // Validate current session
    const session = await validateSession(token);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session invalide ou expirée' },
        { status: 401 }
      );
    }

    // Delete all sessions for this user
    await deleteAllUserSessions(session.userId);

    return NextResponse.json({
      message: 'Déconnexion de tous les appareils réussie',
    });
  } catch (error) {
    console.error('Error deleting all sessions:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/sessions - Refresh current session
export async function PUT(request: Request) {
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

    // Validate and refresh session
    const session = await validateSession(token);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session invalide ou expirée' },
        { status: 401 }
      );
    }

    // Refresh session expiration
    const refreshed = await refreshSession(token);

    if (!refreshed) {
      return NextResponse.json(
        { message: 'Erreur lors du rafraîchissement de la session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Session rafraîchie avec succès',
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
