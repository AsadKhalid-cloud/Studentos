import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('studentos_token'));
    const [loading, setLoading] = useState(true);
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
                }
                else {
                    // Token expired or invalid
                    logout();
                }
            }
            catch {
                // Backend offline or network error
            }
            finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);
    const login = (newToken, newUser) => {
        localStorage.setItem('studentos_token', newToken);
        setToken(newToken);
        setUser(newUser);
    };
    const logout = () => {
        localStorage.removeItem('studentos_token');
        setToken(null);
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, token, loading, login, logout }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
