// app/login.tsx
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    Alert,
    TouchableOpacity,
    ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext'; 

export default function LoginScreen() { 
    const router = useRouter(); 
    const { signIn } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
            return;
        }

        setLoading(true);
        try {
            await signIn(email, password);
            Alert.alert('Sucesso', 'Login realizado com êxito!');
            
            // Redireciona para a primeira aba
            router.replace('/(tabs)/home'); 

        } catch (error: any) {
            const errorMessage = error.message || 'Ocorreu um erro desconhecido durante o login.';
            Alert.alert('Erro no Login', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-Vindo!</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f4f7' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
    subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 40 },
    input: { width: '100%', padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#fff' },
    button: { width: '100%', padding: 15, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkButton: { marginTop: 20 },
    linkText: { color: '#3b82f6', fontSize: 14 },
});