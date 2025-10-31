import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    Button, 
    StyleSheet, 
    Alert,
    TouchableOpacity 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchApi } from '../services/apiClient'; // Importa a função criada no passo anterior

export default function LoginScreen({ navigation }) { // O 'navigation' será usado depois
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Função que replica a lógica do seu js/login.js
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
            return;
        }

        setLoading(true);
        try {
            // A API de login no seu backend Spring Boot é /auth (br.com.desbravadores.api.controller.AuthController)
            const response = await fetchApi('/auth', {
                method: 'POST',
                // O corpo da requisição é adaptado do seu js/login.js
                body: JSON.stringify({ email, password }),
            });

            // Se a API retornar sucesso, ela deve ter um token JWT
            if (response && response.jwtToken) {
                // Salva o token (substitui o localStorage)
                await AsyncStorage.setItem('jwtToken', response.jwtToken);
                
                Alert.alert('Sucesso', 'Login realizado com êxito!');
                
                // PRÓXIMO PASSO CRÍTICO: Redirecionar para a tela principal (Home/Tabs)
                // Usando Expo Router (o método mais comum):
                // router.replace('/home'); 
                // Usando React Navigation (se for a escolha):
                // navigation.replace('MainTabs'); 

                // Por enquanto, vamos apenas logar e limpar a tela:
                console.log('Login bem-sucedido. Redirecionando...');
                setEmail('');
                setPassword('');
            } else {
                Alert.alert('Erro', 'Resposta da API incompleta. Token não encontrado.');
            }

        } catch (error) {
            // Captura erros 401, 403 ou outros erros de rede/API
            const errorMessage = error.message || 'Ocorreu um erro desconhecido durante o login.';
            Alert.alert('Erro no Login', errorMessage);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>BEM-VINDO</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A9A9A9"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#A9A9A9"
                editable={!loading}
            />

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
        </View>
    );
}

// Estilos básicos (baseado no seu design, mas adaptado para RN)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff', // Fundo branco
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        fontSize: 16,
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#007bff', // Cor de destaque (Azul/Verde - ajustar ao seu tema)
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
    },
    linkText: {
        color: '#007bff',
        fontSize: 14,
    },
});