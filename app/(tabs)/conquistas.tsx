// app/(tabs)/conquistas.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, FlatList } from 'react-native';
import { fetchApi } from '../../src/services/apiClient';
import { Ionicons } from '@expo/vector-icons';

// Definição de Tipos (migrados da API)
interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string; // URL parcial (ex: /uploads/...)
    xpReward: number;
}
interface UserBadge {
    id: number;
    name: string; // Usado para match com Achievement.name
}
interface UserProfile {
    badges: UserBadge[];
}

// Cores baseadas no CSS do projeto web
const COLORS = {
    scoutGreen: '#2d5016',
    scoutLightGreen: '#6b8e23',
    scoutGold: '#ffd700',
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    bgPrimary: '#fdfaf6',
    bgSecondary: '#ffffff',
    borderColor: '#e0e0e0',
    scoutTan: '#d2b48c',
};

export default function ConquistasScreen() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [unlockedNames, setUnlockedNames] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    
    // URL base da API para carregar os ícones
    const baseApiUrl = 'http://192.168.56.1:8080'; 

    const fetchConquistas = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Busca todas as conquistas disponíveis para o catálogo
            const allAchievements: Achievement[] = await fetchApi('/api/gamification/achievements');
            
            // 2. Busca o perfil do usuário para ver o que ele já desbloqueou
            const userProfile: UserProfile = await fetchApi('/api/profile/me');
            
            // Cria um Set de nomes para checagem rápida, como no frontend web
            const unlockedNamesSet = new Set(userProfile.badges.map(b => b.name));

            setAchievements(allAchievements);
            setUnlockedNames(unlockedNamesSet);

        } catch (error: any) {
            Alert.alert("Erro ao Carregar", `Não foi possível carregar as conquistas: ${error.message}`);
            setAchievements([]);
            setUnlockedNames(new Set());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConquistas();
    }, [fetchConquistas]);

    // Renderiza cada item da lista
    const renderAchievementCard = ({ item }: { item: Achievement }) => {
        const isUnlocked = unlockedNames.has(item.name);
        
        return (
            <View style={[styles.achievementCardFull, isUnlocked ? styles.unlockedCard : styles.lockedCard]}>
                <View style={styles.achievementHeader}>
                    {/* Constrói a URL completa para o ícone */}
                    <Image 
                        source={{ uri: `${baseApiUrl}${item.icon}` }} 
                        style={styles.achievementIconFull} 
                    />
                    <View style={styles.achievementDetails}>
                        <Text style={styles.achievementTitle}>{item.name}</Text>
                        <Text style={styles.achievementDescription}>{item.description}</Text>
                    </View>
                </View>
                <View style={styles.progressSection}>
                    <Text style={styles.unlockedStatus}>
                        {isUnlocked 
                            ? `⭐ Desbloqueado! (+${item.xpReward} XP)` 
                            : '🔒 Bloqueado'}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.scoutGreen} /></View>;
    }

    if (achievements.length === 0) {
        return <View style={styles.center}><Text style={styles.errorText}>Nenhuma conquista disponível no momento.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Quadro de Conquistas</Text>
            <FlatList
                data={achievements}
                renderItem={renderAchievementCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        paddingHorizontal: 15,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bgPrimary,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.scoutGreen,
        marginTop: 15,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.scoutTan,
    },
    listContainer: {
        paddingBottom: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    
    // Cards de Conquista (Recriando o design do achievement-card-full)
    achievementCardFull: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'column',
        gap: 10,
    },
    unlockedCard: {
        borderLeftWidth: 5,
        borderLeftColor: COLORS.scoutGold,
    },
    lockedCard: {
        borderLeftWidth: 5,
        borderLeftColor: COLORS.borderColor,
        opacity: 0.85,
    },
    achievementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    achievementIconFull: {
        width: 60,
        height: 60,
        borderRadius: 30,
        resizeMode: 'cover',
    },
    achievementDetails: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    achievementDescription: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 3,
    },
    progressSection: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
    },
    unlockedStatus: {
        textAlign: 'center',
        fontWeight: '700',
        color: COLORS.scoutGold, 
    }
});