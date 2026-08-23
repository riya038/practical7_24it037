const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Register a new user
 */
export async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data.details
      ? Object.values(data.details).join(', ')
      : data.message || data.error || 'Registration failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Login user and retrieve JWT token
 */
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    const errorMsg = data.details
      ? Object.values(data.details).join(', ')
      : data.message || data.error || 'Login failed';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Fetch authenticated user profile (/auth/me)
 */
export async function fetchCurrentUser(token) {
  if (!token) throw new Error('No authentication token');

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || data.error || 'Failed to fetch user profile');
  }

  return data.data;
}
