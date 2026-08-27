import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  universityProfile?: {
    universityName?: string;
    department?: string;
    degreeProgram?: string;
    rollNumber?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('studentos_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Verify Active Session on Mount
  useEffect(() => {
    const fetchMe = async () => {
      const savedToken = localStorage.getItem('studentos_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://192.168.10.180:4000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(savedToken);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch {
        // Backend offline or network error
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('studentos_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('studentos_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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