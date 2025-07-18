/**
 * Logout utility function
 * Clears localStorage and redirects to login page
 * (Cookie is cleared by the server)
 */
export function logout() {
  if (typeof window !== 'undefined') {
    // Clear localStorage (cookie is cleared by server)
    localStorage.removeItem('userInfo');
    
    // Redirect to login page
    window.location.href = '/login';
  }
}

/**
 * Logout with API call
 * Makes a request to the logout endpoint then clears localStorage
 */
export async function logoutWithApi() {
  try {
    // Make API call to logout endpoint (clears secure cookie)
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
    });
  } catch (error) {
    console.error('Error during logout API call:', error);
  } finally {
    // Always clear localStorage and redirect, even if API call fails
    logout();
  }
}
