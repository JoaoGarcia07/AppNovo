// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; 
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Importe para usar o signOut

export default function TabsLayout() {
  const { signOut } = useAuth(); // Pega a função de sair do sistema

  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#3b82f6', 
        tabBarInactiveTintColor: '#6b7280', 
    }}>
      {/* 1. Início (home) */}
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="home" color={color} size={24} />),
          headerTitle: 'Desbravadores',
        }}
      />

      {/* 2. Agenda (agenda) */}
      <Tabs.Screen 
        name="agenda" 
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="calendar-alt" color={color} size={24} />),
          headerTitle: 'Agenda de Eventos',
        }}
      />
      
      {/* 3. Conquistas (conquistas) */}
      <Tabs.Screen 
        name="conquistas" 
        options={{
          title: 'Conquistas',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="shield-alt" color={color} size={24} />),
          headerTitle: 'Minhas Conquistas',
        }}
      />
      
      {/* 4. Perfil (perfil) */}
      <Tabs.Screen 
        name="perfil" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="user" color={color} size={24} />),
          headerTitle: 'Meu Perfil',
          // Botão de Logout no cabeçalho
          headerRight: () => (
            <TouchableOpacity 
                onPress={signOut} 
                style={{ marginRight: 15, padding: 5 }}
            >
              <Ionicons name="log-out-outline" size={28} color="#ef4444" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 5. Grupos (grupos) */}
      <Tabs.Screen 
        name="grupos" 
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="users" color={color} size={24} />),
          headerTitle: 'Grupos e Unidades',
        }}
      />

      {/* 6. Notificações (notifications) */}
      <Tabs.Screen 
        name="notifications" 
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="bell" color={color} size={24} />),
          headerTitle: 'Notificações',
        }}
      />

      {/* 7. Configurações (settings) */}
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="cog" color={color} size={24} />),
          headerTitle: 'Configurações do App',
        }}
      />
    </Tabs>
  );
}