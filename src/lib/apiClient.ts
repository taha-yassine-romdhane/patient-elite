/**
 * API client utility for making authenticated requests
 * Uses localStorage for token storage instead of cookies
 */

/**
 * Makes an authenticated fetch request with the token from localStorage
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The fetch response
 */
export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Get token and user info from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  let userInfo = null;
  
  if (typeof window !== 'undefined') {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        userInfo = JSON.parse(userInfoStr);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }
  
  // Set up headers with Authorization if token exists
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // Return fetch with the updated options
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle authentication errors
  if (response.status === 401) {
    // Clear authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  } else if (response.status === 403) {
    // Handle forbidden errors (role-based access control)
    if (typeof window !== 'undefined' && userInfo) {
      // Redirect to appropriate dashboard based on role
      const dashboardPath = userInfo.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
      window.location.href = dashboardPath;
    }
  }
  
  return response;
}

/**
 * Check if the user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

/**
 * Get the current user info from localStorage
 * @returns The user info object or null if not authenticated
 */
export function getUserInfo() {
  if (typeof window === 'undefined') return null;
  
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null;
  
  try {
    return JSON.parse(userInfo);
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
}
