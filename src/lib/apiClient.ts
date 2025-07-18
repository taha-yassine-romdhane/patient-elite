/**
 * API client utility for making authenticated requests
 * Uses secure cookies for HTTPS production deployment
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
  // Get user info from localStorage for client-side access
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
  
  // Set up headers and include credentials for cookies
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  };

  // Return fetch with credentials included for cookies
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Important: include cookies
  });
  
  // Handle authentication errors
  if (response.status === 401) {
    // Clear authentication data
    if (typeof window !== 'undefined') {
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
  // With cookies, we check if user info exists (cookie is httpOnly)
  return !!localStorage.getItem('userInfo');
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
