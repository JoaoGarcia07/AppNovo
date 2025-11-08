// app/(tabs)/home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchApi } from '../../src/services/apiClient'; 
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image'; 

// Definição do Tipo de Tarefa para tipagem segura
interface Task {
    id: number;
    title: string;
    description: string;
    date: string; // Ex: "2025-06-21"
    time: string; // Ex: "10:00:00"
}

// Cores baseadas em seu CSS/Variáveis (corrigidas para inclusão no objeto)
const COLORS = {
    scoutGreen: '#2d5016',
    scoutLightGreen: '#6b8e23',
    scoutGold: '#ffd700',
    scoutOrange: '#ff6b35',
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    bgPrimary: '#fdfaf6',
    bgSecondary: '#ffffff',
    borderColor: '#e0e0e0',
    // CORREÇÃO: Adicionando as cores faltantes com fallback direto para o objeto
    scoutTan: '#d2b48c', 
    scoutBrown: '#8b4513',
};

// --- Componente: Lembretes do Mês (RenderReminders) ---
const RemindersSection = () => {
    const [reminders, setReminders] = useState<Task[] | null>([]);
    const [loading, setLoading] = useState(true);
    const [monthDisplay, setMonthDisplay] = useState('');

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        const apiMonth = currentMonth + 1; // API espera 1-12
        
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        setMonthDisplay(monthNames[currentMonth]);

        try {
            const tasks: Task[] = await fetchApi(`/api/tasks?year=${currentYear}&month=${apiMonth}`);

            if (!tasks || tasks.length === 0) {
                setReminders([]);
                return;
            }

            // CORREÇÃO LINHA 49: Adicionado tipagem explícita 'Task' e uso do 'date' para a ordenação
            tasks.sort((a: Task, b: Task) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            setReminders(tasks);
        } catch (error) {
            console.error("Erro ao carregar lembretes:", error);
            setReminders(null); // Sinaliza falha
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    return (
        <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>Lembretes do Mês</Text>
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.scoutGreen} />
            ) : reminders === null ? (
                <Text style={{ color: 'red' }}>Falha ao carregar lembretes.</Text>
            ) : reminders.length === 0 ? (
                <Text style={styles.reminderPlaceholder}>Nenhum evento principal agendado para {monthDisplay}.</Text>
            ) : (
                <View style={styles.remindersGrid}>
                    {reminders.map(task => {
                        const day = new Date(task.date).getDate();
                        return (
                            <View key={task.id} style={styles.reminderCard}>
                                <Text style={styles.reminderDate}>
                                    <Ionicons name="calendar-outline" size={14} color={COLORS.scoutGreen} />
                                    {' '}{day} de {monthDisplay}
                                </Text>
                                <Text style={styles.reminderTitle}>{task.title}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};


// Componente: Categorias (Hardcoded)
const CategoriesSection = () => {
    // Dados hardcoded baseados no js/views/home.js
    const categories = [
        { title: "Aventuras Radicais", description: "Atividades de adrenalina para os mais corajosos.", icon: "flame-outline", color: COLORS.scoutOrange },
        { title: "Trilhas e Natureza", description: "Explore a flora e fauna em trilhas ecológicas.", icon: "leaf-outline", color: COLORS.scoutLightGreen },
        // CORREÇÃO LINHA 100: Usando a cor definida no objeto COLORS
        { title: "Camping Noturno", description: "Acampe sob as estrelas em locais seguros.", icon: "tent-outline", color: COLORS.scoutBrown },
    ];

    const handlePress = (title: string) => {
        Alert.alert("Navegação", `Carregando categoria: ${title}`);
    };

    return (
        <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categorias de Aventura</Text>
            {categories.map((cat, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.categoryCard, { borderLeftColor: cat.color }]}
                    onPress={() => handlePress(cat.title)}
                >
                    <Ionicons name={cat.icon as any} size={28} color={cat.color} style={styles.categoryIcon} />
                    <View>
                        <Text style={styles.categoryTitle}>{cat.title}</Text>
                        <Text style={styles.categoryDescription}>{cat.description}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// Componentes QuickStats e ScoutOfTheMonth
const QuickStats = () => (
    <View style={styles.quickStats}>
        <Text style={styles.statsTitle}>Estatísticas do Acampamento</Text>
        <View style={styles.statItem}><Text style={styles.statItemLabel}>Aventureiros Ativos</Text><Text style={styles.statItemValue}>12.5K</Text></View>
        <View style={styles.statItem}><Text style={styles.statItemLabel}>Experiências Concluídas</Text><Text style={styles.statItemValue}>8.2K</Text></View>
        <View style={styles.statItemLast}><Text style={styles.statItemLabel}>Avaliação Média</Text><Text style={styles.statItemValue}>4.8 ⭐</Text></View>
    </View>
);
const ScoutOfTheMonth = () => (
    <View style={styles.scoutOfTheMonthWidget}>
        <Text style={styles.statsTitle}><Text style={styles.sotmStar}>⭐</Text> Desbravador do Mês</Text>
        <Text style={styles.sotmPlaceholder}>Em Breve: Ranking de Aventureiros</Text>
    </View>
);


// --- Tela Principal (Home/Index) ---
export default function HomeTabScreen() {
    const heroImageSource = require('../../../assets/images/home-banner.png'); 
    
    return (
        <ScrollView style={styles.container}>
            
            {/* Hero Section */}
            <ImageBackground 
                source={heroImageSource} 
                style={styles.heroSection}
                imageStyle={styles.heroImageStyle}
            >
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>Explore a Natureza</Text>
                    <Text style={styles.heroSubtitle}>Descubra experiências incríveis, organize suas atividades e conquiste emblemas.</Text>
                </View>
            </ImageBackground>

            <View style={styles.homeGrid}>
                <View style={styles.mainContent}>
                    <RemindersSection />
                    <CategoriesSection />
                </View>
                <View style={styles.sidebar}>
                    <QuickStats />
                    <ScoutOfTheMonth />
                </View>
            </View>
        </ScrollView>
    );
}

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.scoutGreen,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 3,
        // CORREÇÃO LINHA 140: Acesso direto à cor definida no objeto COLORS
        borderBottomColor: COLORS.scoutTan, 
    },
    
    // Hero Section
    heroSection: {
        height: 200,
        borderRadius: 15,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    heroImageStyle: {
        opacity: 0.7, 
        borderRadius: 15,
    },
    heroContent: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        textAlign: 'center',
        marginTop: 5,
    },

    // Grid e Estrutura
    homeGrid: {
        gap: 20,
    },
    mainContent: {
        gap: 20,
    },
    sidebar: {
        gap: 20,
        marginBottom: 20,
    },

    // Reminders Section
    remindersSection: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 12,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    remindersGrid: {
        gap: 10,
    },
    reminderCard: {
        backgroundColor: COLORS.bgPrimary,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.scoutLightGreen,
        padding: 15,
        borderRadius: 8,
    },
    reminderDate: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.scoutGreen,
        marginBottom: 5,
    },
    reminderTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    reminderPlaceholder: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 10,
    },

    // Categories Section
    categoriesSection: {
        gap: 10,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        backgroundColor: COLORS.bgSecondary,
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    categoryIcon: {
        width: 30,
        textAlign: 'center',
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    categoryDescription: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },

    // Quick Stats
    quickStats: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 12,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.scoutGreen,
        marginBottom: 10,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    statItemLast: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    statItemLabel: {
        color: COLORS.textSecondary,
    },
    statItemValue: {
        fontWeight: '700',
        color: COLORS.textPrimary,
    },

    // Scout of the Month
    scoutOfTheMonthWidget: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 12,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sotmStar: {
        color: COLORS.scoutGold,
    },
    sotmPlaceholder: {
        fontSize: 14,
        color: COLORS.textSecondary,
        paddingVertical: 10,
    }
});