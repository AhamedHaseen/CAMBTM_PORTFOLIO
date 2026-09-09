/**
 * Safely parse JSON from fetch Response without crashing on HTML (<!DOCTYPE...)
 */
export async function parseResponseJson(res) {
  if (!res) {
    return { success: false, error: 'No response received from API.' };
  }

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Malformed JSON returned from server.' };
    }
  }

  try {
    const text = await res.text();
    if (text.trim().startsWith('<')) {
      return {
        success: false,
        error: res.status === 404
          ? 'API route not found (404).'
          : `Server returned an HTML response (${res.status}). Please check API server.`
      };
    }
    return { success: false, error: text || `Server error (${res.status})` };
  } catch (err) {
    return { success: false, error: err.message || 'Error parsing response' };
  }
}

/**
 * Universal API request wrapper with dual-channel routing (Proxy + Direct fallback)
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('cambm_token');
  const headers = {
    'Accept': 'application/json',
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Primary URL using Vite relative proxy
  const primaryUrl = cleanEndpoint;
  
  // Direct fallback URL in case Vite dev proxy is stale or un-restarted
  const fallbackUrl = `http://127.0.0.1:5000${cleanEndpoint}`;

  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers,
      credentials: 'include'
    });

    const contentType = res.headers.get('content-type') || '';
    // If proxy returned HTML error page (502 / 504 / 404 proxy fallback)
    if (!contentType.includes('application/json') && (res.status === 404 || res.status >= 500)) {
      throw new Error('Proxy returned non-JSON response');
    }

    return res;
  } catch (proxyError) {
    // Attempt direct call to port 5000 with CORS
    try {
      const directRes = await fetch(fallbackUrl, {
        ...options,
        headers,
        credentials: 'include'
      });
      return directRes;
    } catch (directError) {
      throw new Error('Cannot reach backend server. Please verify backend is running on port 5000.');
    }
  }
}

export default apiRequest;
