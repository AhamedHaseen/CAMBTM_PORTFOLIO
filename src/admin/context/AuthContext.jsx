import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiRequest, parseResponseJson } from '../utils/api';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes strict session timeout

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef(Date.now());

  // Check current session on initial load
  const checkAuth = async () => {
    try {
      const res = await apiRequest('/api/auth/me');
      const data = await parseResponseJson(res);
      if (data && data.success && data.user) {
        setUser(data.user);
        if (data.token) {
          localStorage.setItem('cambm_token', data.token);
        }
        setLoading(false);
        return;
      }
      localStorage.removeItem('cambm_token');
      setUser(null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Strict 15-Minute Session Inactivity Management
  useEffect(() => {
    if (!user) return;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, recordActivity, { passive: true }));

    const inactivityInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) {
        logout();
        alert('Session expired due to 15 minutes of inactivity. For your security, you have been automatically logged out.');
      }
    }, 30000); // Check every 30 seconds

    return () => {
      events.forEach(event => window.removeEventListener(event, recordActivity));
      clearInterval(inactivityInterval);
    };
  }, [user]);

  const login = async (email, password, rememberMe = false) => {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await parseResponseJson(res);

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed. Please check credentials.');
    }

    // If 2FA is required, return without setting token yet
    if (data.requires2FA) {
      return data;
    }

    if (data.token) {
      localStorage.setItem('cambm_token', data.token);
    }
    setUser(data.user);
    lastActivityRef.current = Date.now();
    return data;
  };

  const verify2FA = async (tempToken, code) => {
    const res = await apiRequest('/api/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, code })
    });

    const data = await parseResponseJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.error || '2FA Verification failed.');
    }

    if (data.token) {
      localStorage.setItem('cambm_token', data.token);
    }
    setUser(data.user);
    lastActivityRef.current = Date.now();
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      localStorage.removeItem('cambm_token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await apiRequest('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    const data = await parseResponseJson(res);
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Could not update profile');
    }
    await checkAuth();
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, logout, checkAuth, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
