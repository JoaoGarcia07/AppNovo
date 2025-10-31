// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons'; 
import { useAuth } from '../../src/context/AuthContext';
import { TouchableOpacity, Text } from 'react-native';

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
        }}
      />

      {/* 2. Agenda (agenda) */}
      <Tabs.Screen 
        name="agenda" 
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="calendar-alt" color={color} size={24} />),
        }}
      />
      
      {/* 3. Conquistas (conquistas) */}
      <Tabs.Screen 
        name="conquistas" 
        options={{
          title: 'Conquistas',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="shield-alt" color={color} size={24} />),
        }}
      />
      
      {/* 4. Perfil (perfil) */}
      <Tabs.Screen 
        name="perfil" 
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="user" color={color} size={24} />),
          // Adiciona o botão de Logout no cabeçalho
          headerRight: () => (
            <TouchableOpacity 
                onPress={signOut} 
                style={{ marginRight: 15, padding: 5 }}
            >
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
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
        }}
      />

      {/* 6. Notificações (notifications) */}
      <Tabs.Screen 
        name="notifications" 
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="bell" color={color} size={24} />),
        }}
      />

      {/* 7. Configurações (settings) */}
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color }) => (<FontAwesome5 name="cog" color={color} size={24} />),
        }}
      />
    </Tabs>
  );
}