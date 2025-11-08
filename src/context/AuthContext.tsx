// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi } from '../services/apiClient'; // Importação do seu serviço
import { Alert } from 'react-native';

// Helper para decodificar o token e pegar a role
function decodeToken(token: string) {
    try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        // Usa atob (função global) para decodificar
        return JSON.parse(atob(payloadBase64)); 
    } catch (e) {
        return null;
    }
}

// Definição da Interface do Contexto (Adicionando userRole)
interface AuthContextType {
    token: string | null;
    userRole: 'DESBRAVADOR' | 'MONITOR' | 'DIRETOR' | null; // <--- NOVO: Tipagem do cargo
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<string | null>; // Retorna a role ou null
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'DESBRAVADOR' | 'MONITOR' | 'DIRETOR' | null>(null); // <--- NOVO STATE
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('jwtToken');
                if (storedToken) {
                    const payload = decodeToken(storedToken);
                    // Aqui você faria a checagem de expiração do token (payload.exp)
                    
                    setToken(storedToken);
                    setUserRole(payload?.role || null); // <--- SETA O CARGO
                }
            } catch (e) {
                console.error("Erro ao carregar token:", e);
                await AsyncStorage.removeItem('jwtToken');
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // OBS: Seu endpoint de login é /auth/login. O endpoint /auth não funcionaria no Spring Boot
            const response = await fetchApi('/auth/login', { 
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (response && response.token) { // Mudado de response.jwtToken para response.token
                const token = response.token;
                await AsyncStorage.setItem('jwtToken', token);
                
                const payload = decodeToken(token);
                setToken(token);
                setUserRole(payload?.role || null);
                
                return payload?.role || null;

            }
            throw new Error('Resposta de login inválida. Token não encontrado.');

        } catch (error: any) {
            setToken(null);
            setUserRole(null);
            Alert.alert('Erro de Login', error.message || 'Credenciais inválidas.');
            throw error;
        } finally {
             setIsLoading(false);
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('jwtToken');
        setToken(null);
        setUserRole(null);
    };

    const value: AuthContextType = {
        token,
        userRole, // <--- EXPOSTO
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