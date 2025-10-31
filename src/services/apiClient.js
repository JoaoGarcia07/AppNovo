// src/services/apiClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// **CORREÇÃO:** Adicione a porta :8080
const API_BASE_URL = 'http://192.168.56.1:8080'; 

/**
 * Função global para fazer requisições autenticadas à API.
 */
export async function fetchApi(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('jwtToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, 
    };
    
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        if (response.status === 401 || response.status === 403) {
            await AsyncStorage.removeItem('jwtToken');
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = errorText || `Erro na requisição: Status ${response.status}`;
            
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // Não é JSON
            }
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }
        return null; 

    } catch (error) {
        console.error("Erro na chamada da API:", error);
        throw error;
    }
}