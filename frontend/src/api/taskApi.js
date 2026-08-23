const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let onUnauthorizedCallback = null;

export function setUnauthorizedHandler(callback) {
  onUnauthorizedCallback = callback;
}

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback(data.message || 'Session expired. Please log in again.');
    }
    throw new Error(data.message || 'Unauthorized. Please login again.');
  }

  if (!res.ok || !data.success) {
    const errorDetails = data.details
      ? Object.values(data.details).join(', ')
      : data.message || data.error || 'Request failed';
    throw new Error(errorDetails);
  }

  return data;
};

/**
 * Check backend server health
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { online: true, data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

/**
 * Fetch all tasks for logged-in user
 */
export async function fetchTasks(token) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await handleResponse(res);
  return data.data;
}

/**
 * Create a new task (Protected)
 */
export async function createTask(taskData, token) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  });
  const data = await handleResponse(res);
  return data.data;
}

/**
 * Update an existing task (Protected)
 */
export async function updateTask(id, updateData, token) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });
  const data = await handleResponse(res);
  return data.data;
}

/**
 * Delete a task (Protected)
 */
export async function deleteTask(id, token) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await handleResponse(res);
  return data.data;
}
