import React, { createContext, useContext, useEffect, useState } from 'react';
import type { IUser } from '@eldercare/shared';
import { getAuthToken, getUserProfile, removeAuthToken, updateUserProfile } from '../services/api';

interface AuthContextType {
  token: string | null;
  user: IUser | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  largeTextMode: boolean;
  setAuthData: (token: string, userId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  toggleLargeTextMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('eldercare_user_id'));
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [largeTextMode, setLargeTextMode] = useState<boolean>(
    localStorage.getItem('eldercare_large_text') === 'true',
  );

  useEffect(() => {
    if (largeTextMode) {
      document.body.classList.add('large-text-mode');
    } else {
      document.body.classList.remove('large-text-mode');
    }
    localStorage.setItem('eldercare_large_text', String(largeTextMode));
  }, [largeTextMode]);

  const refreshUser = async () => {
    if (!userId) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await getUserProfile(userId);
      setUser(profile);
      if (profile.accessibility?.largeText !== undefined) {
        setLargeTextMode(profile.accessibility.largeText);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [userId, token]);

  const setAuthData = async (newToken: string, newUserId: string) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('eldercare_user_id', newUserId);
    await refreshUser();
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('eldercare_user_id');
    setToken(null);
    setUserId(null);
    setUser(null);
  };

  const toggleLargeTextMode = async () => {
    const nextVal = !largeTextMode;
    setLargeTextMode(nextVal);
    if (user && userId) {
      try {
        await updateUserProfile(userId, {
          accessibility: {
            largeText: nextVal,
            voiceEnabled: user.accessibility?.voiceEnabled ?? false,
          },
        });
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        userId,
        isAuthenticated: !!token && !!userId,
        isLoading,
        largeTextMode,
        setAuthData,
        logout,
        refreshUser,
        toggleLargeTextMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
