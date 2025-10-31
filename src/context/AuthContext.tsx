// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi } from '../services/apiClient';

// (Omissão de tipos para brevidade, mas use o código sugerido na resposta anterior se quiser tipagem completa)

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('jwtToken');
                setToken(storedToken);
            } catch (e) {
                console.error("Erro ao carregar token:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const signIn = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await fetchApi('/auth', { 
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (response && response.jwtToken) {
                await AsyncStorage.setItem('jwtToken', response.jwtToken);
                setToken(response.jwtToken);
                return true;
            }
            throw new Error('Resposta de login inválida.');

        } catch (error) {
            setToken(null);
            throw error;
        } finally {
             setIsLoading(false);
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('jwtToken');
        setToken(null);
    };

    const value = {
        token,
        isAuthenticated: !!token,
        isLoading,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}