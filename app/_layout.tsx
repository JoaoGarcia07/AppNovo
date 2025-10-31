// app/_layout.tsx (Substitua todo o conteúdo)
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router'; 
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/context/AuthContext'; 

export const unstable_settings = {
  anchor: '(tabs)',
};

// Layout com a lógica de autenticação
function RootLayoutContent() {
    const colorScheme = useColorScheme();
    const { isAuthenticated, isLoading } = useAuth(); 

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }
    
    // SE NÃO ESTÁ LOGADO, FORÇA A NAVEGAÇÃO PARA O LOGIN
    if (!isAuthenticated) {
        return (
            <Stack>
                {/* 🚨 ESSA LINHA RESOLVE O SEU ERRO, pois reconhece 'login' */}
                <Stack.Screen name="login" options={{ headerShown: false }} /> 
                
                {/* Rotas secundárias que ainda precisam ser listadas na Stack principal */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
        );
    }

    // SE ESTÁ LOGADO, MOSTRA O CONTEÚDO PRINCIPAL (TABS)
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
  );
}

// O componente que envolve tudo no AuthProvider
export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutContent />
        </AuthProvider>
    );
}