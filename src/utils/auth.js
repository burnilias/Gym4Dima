// Authentication utility functions

// Check if user is authenticated by making a request to the PHP backend
export const checkAuth = async () => {
  try {
    const response = await fetch('http://localhost/onlyfront%20-%20Copy/api/check-auth.php', {
      method: 'GET',
      credentials: 'include', // Important for PHP sessions to work
    });

    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Get current user info
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
};

// Logout user
export const logout = async () => {
  try {
    await fetch('http://localhost/onlyfront%20-%20Copy/api/logout.php', {
      method: 'POST',
      credentials: 'include', // Important for PHP sessions to work
    });
    
    // Clear local storage
    localStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};
