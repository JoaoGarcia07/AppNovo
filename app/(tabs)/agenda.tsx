// app/(tabs)/agenda.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { fetchApi } from '../../src/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment'; // Utilizaremos a biblioteca Moment.js para manipulação de datas

// NOTA: Para este código funcionar, você precisará instalar o moment:
// npx expo install moment

// Definição de Tipos
interface Task {
    id: number;
    title: string;
    description: string;
    date: string; // Ex: "YYYY-MM-DD"
    time: string; // Ex: "HH:MM:SS"
}

// Cores baseadas em seu CSS/Variáveis
const COLORS = {
    scoutGreen: '#2d5016',
    scoutLightGreen: '#6b8e23',
    scoutTan: '#d2b48c',
    scoutOrange: '#ff6b35',
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    bgPrimary: '#fdfaf6',
    bgSecondary: '#ffffff',
    borderColor: '#e0e0e0',
};

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const weekdayShortNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaScreen() {
    const now = moment();
    
    // Estado do Calendário
    const [currentMonthMoment, setCurrentMonthMoment] = useState(moment());
    const [selectedDayMoment, setSelectedDayMoment] = useState(moment());
    
    const [activities, setActivities] = useState<{ [key: number]: Task[] }>({});
    const [loading, setLoading] = useState(false);

    const currentMonth = currentMonthMoment.month();
    const currentYear = currentMonthMoment.year();
    const selectedDay = selectedDayMoment.date();

    // --- Lógica de busca de tarefas (fetchActivitiesForMonth) ---
    const fetchActivitiesForMonth = useCallback(async (targetMoment: moment.Moment) => {
        setLoading(true);
        try {
            const targetYear = targetMoment.year();
            const apiMonth = targetMoment.month() + 1; // API espera 1-12
            
            const tasks: Task[] = await fetchApi(`/api/tasks?year=${targetYear}&month=${apiMonth}`);
            
            const activitiesByDay: { [key: number]: Task[] } = {};
            tasks.forEach(task => {
                const day = moment(task.date).date();
                if (!activitiesByDay[day]) {
                    activitiesByDay[day] = [];
                }
                // Adiciona a tarefa ao dia correspondente
                activitiesByDay[day].push(task);
            });
            setActivities(activitiesByDay);

        } catch (error) {
            Alert.alert("Erro de Agenda", "Não foi possível carregar as atividades.");
            setActivities({});
        } finally {
            setLoading(false);
        }
    }, []);

    // Busca as atividades sempre que o mês muda
    useEffect(() => {
        fetchActivitiesForMonth(currentMonthMoment);
    }, [currentMonthMoment, fetchActivitiesForMonth]);

    // --- Funções de Navegação do Mês ---
    const changeMonth = (delta: number) => {
        const newMoment = currentMonthMoment.clone().add(delta, 'months');
        setCurrentMonthMoment(newMoment);
        
        // Tenta manter o dia selecionado se for válido no novo mês, senão volta para o dia 1
        const newDay = Math.min(selectedDay, newMoment.daysInMonth());
        setSelectedDayMoment(newMoment.clone().date(newDay));
    };

    const handleDaySelect = (day: number) => {
        setSelectedDayMoment(currentMonthMoment.clone().date(day));
    };

    // --- Renderização da Timeline (Eventos do Dia) ---
    const renderTimeline = () => {
        const dayActivities = activities[selectedDay] || [];
        const dayTitle = `${dayNames[selectedDayMoment.day()]}, ${selectedDay} de ${monthNames[currentMonth]}`;

        return (
            <ScrollView style={styles.scheduleWrapper} contentContainerStyle={styles.scheduleContent}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleTitle}>{dayTitle}</Text>
                </View>
                
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.scoutGreen} style={{ marginTop: 20 }} />
                ) : dayActivities.length === 0 ? (
                    <Text style={styles.timelinePlaceholder}>Nenhuma atividade programada para este dia.</Text>
                ) : (
                    <View style={styles.timeline}>
                        {dayActivities.sort((a, b) => a.time.localeCompare(b.time)).map((act, index) => (
                            <View key={index} style={styles.timelineItem}>
                                <Text style={styles.timelineTime}>{act.time.substring(0, 5)}</Text>
                                <TouchableOpacity 
                                    style={styles.timelineContent}
                                    onPress={() => Alert.alert(act.title, act.description || 'Sem descrição.')}
                                >
                                    <Text style={styles.timelineContentTitle}>{act.title}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        );
    };

    // --- Renderização do Calendário ---
    const renderCalendarGrid = () => {
        const firstDayOfMonth = currentMonthMoment.clone().startOf('month').day(); // 0 (Dom) a 6 (Sáb)
        const daysInMonth = currentMonthMoment.daysInMonth();
        const calendarDays = [];

        // Preenche com espaços vazios
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
        }

        // Preenche com os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const numActivities = activities[day]?.length || 0;
            const isSelected = currentMonthMoment.isSame(selectedDayMoment, 'month') && day === selectedDay;

            calendarDays.push(
                <TouchableOpacity
                    key={day}
                    style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                    onPress={() => handleDaySelect(day)}
                >
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{day}</Text>
                    {numActivities > 0 && (
                        <View style={[styles.activityBadge, isSelected && styles.activityBadgeSelected]}>
                            <Text style={[styles.activityBadgeText, isSelected && { color: COLORS.scoutGreen }]}>{numActivities}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.calendarGrid}>
                {weekdayShortNames.map((name, index) => (
                    <Text key={index} style={styles.calendarWeekday}>{name}</Text>
                ))}
                {calendarDays}
            </View>
        );
    };

    return (
        <ScrollView style={styles.agendaContainer}>
            {/* Bloco do Calendário */}
            <View style={styles.calendarWrapper}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthNavArrow}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.scoutGreen} />
                    </TouchableOpacity>
                    <Text style={styles.monthYear}>{monthNames[currentMonth]} {currentYear}</Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthNavArrow}>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.scoutGreen} />
                    </TouchableOpacity>
                </View>
                {renderCalendarGrid()}
            </View>
            
            {/* Bloco da Agenda/Timeline */}
            {renderTimeline()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    agendaContainer: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
        padding: 15,
    },
    // --- Calendário Styles ---
    calendarWrapper: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    monthYear: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.scoutGreen,
    },
    monthNavArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.scoutGreen,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    calendarWeekday: {
        width: `${100 / 7}%`,
        textAlign: 'center',
        fontWeight: '600',
        color: COLORS.textSecondary,
        paddingBottom: 5,
    },
    calendarDay: {
        width: `${100 / 7}%`,
        height: 55, 
        padding: 5,
        borderRadius: 10,
        backgroundColor: COLORS.bgPrimary,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 5,
        // Adicionando um pequeno padding/margin para evitar que os dias se toquem
        marginHorizontal: 1, 
        borderWidth: 1,
        borderColor: COLORS.bgPrimary,
    },
    calendarDayEmpty: {
        width: `${100 / 7}%`,
        height: 55,
        marginBottom: 5,
    },
    dayNumber: {
        width: '100%',
        textAlign: 'left',
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
    calendarDaySelected: {
        backgroundColor: COLORS.scoutGreen,
        borderColor: COLORS.scoutGreen,
    },
    dayNumberSelected: {
        color: 'white',
        fontWeight: '700',
    },
    activityBadge: {
        backgroundColor: COLORS.scoutOrange,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityBadgeSelected: {
        backgroundColor: 'white',
    },
    activityBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },

    // --- Timeline Styles ---
    scheduleWrapper: {
        flex: 1,
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 20,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    scheduleContent: {
        minHeight: Dimensions.get('window').height / 3, // Garante que a ScrollView tenha um tamanho decente
    },
    scheduleHeader: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.borderColor,
    },
    scheduleTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    timelinePlaceholder: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 20,
    },
    timeline: {
        gap: 10,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'flex-start',
    },
    timelineTime: {
        fontWeight: '700',
        color: COLORS.scoutGreen,
        width: 60,
    },
    timelineContent: {
        flexGrow: 1,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.scoutLightGreen,
        backgroundColor: COLORS.bgPrimary,
        borderRadius: 8,
        padding: 10,
        paddingLeft: 15,
    },
    timelineContentTitle: {
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
});