import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/auth';

export const PRESET_ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  username: 'admin',
  name: 'Dr. Elena Rostova',
  role: 'ADMIN',
  badgeId: 'DIR-8942',
  email: 'e.rostova@cyberforensics.gov',
  title: 'Chief Forensic Officer & System Auditor',
  department: 'National Digital Evidence & Sanitization Command',
  clearanceLevel: 'LEVEL_5_TOP_SECRET',
  lastLogin: '2026-09-10T15:40:00Z',
  avatarColor: 'bg-gradient-to-tr from-purple-600 to-indigo-600'
};

export const PRESET_FIELD_USER: UserProfile = {
  id: 'usr-investigator-02',
  username: 'user',
  name: 'Senior Investigator J. Miller',
  role: 'USER',
  badgeId: 'INV-5104',
  email: 'j.miller@cyberforensics.gov',
  title: 'Digital Forensics Field Examiner',
  department: 'Evidence Acquisition & Carving Unit',
  clearanceLevel: 'LEVEL_4_SECRET',
  lastLogin: '2026-09-10T15:35:00Z',
  avatarColor: 'bg-gradient-to-tr from-cyan-600 to-teal-600'
};

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  quickLogin: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: PRESET_ADMIN_USER,
  isAuthenticated: true,
  isAdmin: true,
  login: async () => ({ success: true }),
  quickLogin: () => {},
  switchRole: () => {},
  logout: () => {}
});

const AUTH_STORAGE_KEY = 'aegis_auth_session_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    // Default logged in as Admin for full immediate demo accessibility
    return PRESET_ADMIN_USER;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {}
  }, [currentUser]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if ((cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'admin')) || cleanUser === 'admin') {
      const profile = { ...PRESET_ADMIN_USER, lastLogin: new Date().toISOString() };
      setCurrentUser(profile);
      return { success: true };
    }

    if ((cleanUser === 'user' || cleanUser === 'investigator') && (cleanPass === 'user123' || cleanPass === 'user' || cleanPass === 'password')) {
      const profile = { ...PRESET_FIELD_USER, lastLogin: new Date().toISOString() };
      setCurrentUser(profile);
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid credentials. Use admin / admin123 (for Admin) or user / user123 (for User).'
    };
  };

  const quickLogin = (role: UserRole) => {
    if (role === 'ADMIN') {
      setCurrentUser({ ...PRESET_ADMIN_USER, lastLogin: new Date().toISOString() });
    } else {
      setCurrentUser({ ...PRESET_FIELD_USER, lastLogin: new Date().toISOString() });
    }
  };

  const switchRole = (role: UserRole) => {
    quickLogin(role);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      isAdmin,
      login,
      quickLogin,
      switchRole,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
