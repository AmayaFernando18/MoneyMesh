import React, { createContext, useContext, useState, useEffect } from 'react';
import { getItem, setItem, deleteItem } from '../services/storage';
import api from '../services/api';

interface AuthContextType {
    user: any;
    token: string | null;
    isLoading: boolean;
    signIn: (token: string, user: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedToken = await getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                    // Verify token and get user details
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                }
            } catch (e: any) {
                if (e.response && (e.response.status === 401 || e.response.status === 404)) {
                    console.log('Session expired or user not found. Clearing auth.');
                } else {
                    console.error('Failed to load user', e);
                }
                await deleteItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const signIn = async (newToken: string, newUser: any) => {
        setToken(newToken);
        setUser(newUser);
        await setItem('token', newToken);
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await deleteItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
