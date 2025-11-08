// src/screens/admin/ChamadaScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; 
import { fetchApi } from '../../services/apiClient'; 
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; // <--- CORREÇÃO: useAuth importado

// Definição de Tipos
interface Member {
    id: number;
    name: string;
    surname: string;
    avatar: string;
}

// Cores baseadas no CSS/Contexto
const COLORS = {
    scoutGreen: '#2d5016',
    scoutLightGreen: '#6b8e23',
    textPrimary: '#2c3e50',
    textSecondary: '#7f8c8d',
    bgPrimary: '#fdfaf6',
    bgSecondary: '#ffffff',
    borderColor: '#e0e0e0',
    danger: '#c62828',
    success: '#2e7d32',
};

// Data atual para inicialização
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function ChamadaScreen() {
    // CORREÇÃO LINHA 37: Desestruturação correta após correção do AuthContext
    const { userRole } = useAuth();
    
    // Estado dos dados
    const [members, setMembers] = useState<Member[]>([]); 
    const [loading, setLoading] = useState(true);
    const [chamadaDate, setChamadaDate] = useState(today);
    const [presentUserIds, setPresentUserIds] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const baseApiUrl = 'http://192.168.56.1:8080'; // Use o seu IP

    // 1. Busca dos membros do grupo
    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const membersList: Member[] = await fetchApi('/api/chamada/my-group-members');
            setMembers(membersList);
        } catch (error: any) { 
            Alert.alert("Erro de Carga", `Não foi possível carregar os membros: ${error.message}`);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userRole === 'MONITOR' || userRole === 'DIRETOR') {
            fetchMembers();
        }
    }, [fetchMembers, userRole]);

    // 2. Lógica de toggle de presença
    const togglePresence = (id: number) => {
        setPresentUserIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(id)) {
                newIds.delete(id);
            } else {
                newIds.add(id);
            }
            return newIds;
        });
    };

    // 3. Submissão da Chamada
    const handleSubmitChamada = async () => {
        if (isSubmitting) return;

        if (userRole !== 'MONITOR') {
             Alert.alert("Acesso Negado", "Apenas Monitores podem submeter a chamada.");
             return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                date: formatDate(chamadaDate),
                presentUserIds: Array.from(presentUserIds),
            };

            const response = await fetchApi('/api/chamada/submit', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            Alert.alert('Sucesso', response.message || `Chamada para ${formatDate(chamadaDate)} registrada com sucesso!`);
            setPresentUserIds(new Set()); 

        } catch (error: any) { 
            Alert.alert('Erro ao Submeter', error.message || 'Falha ao registrar a chamada.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // CORREÇÃO LINHA 115: Tipagem correta do DatePickerEvent
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        
        // No Android, o date picker se fecha automaticamente
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            setChamadaDate(selectedDate);
        }
        
        // No iOS, fechar o picker após a seleção
        if (Platform.OS === 'ios') {
            setShowDatePicker(false);
        }
    };

    if (userRole !== 'MONITOR' && userRole !== 'DIRETOR') {
         return <View style={styles.center}><Text>Acesso não autorizado a esta funcionalidade.</Text></View>;
    }

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.scoutGreen} /></View>;
    }
    
    if (members.length === 0) {
        return <View style={styles.center}><Text style={styles.messageText}>O seu grupo ainda não tem desbravadores associados.</Text></View>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.adminWidget}>
                <Text style={styles.widgetTitle}>Chamada do Grupo</Text>
                
                {/* Seleção de Data */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Selecione a data da chamada:</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.scoutGreen} />
                        <Text style={styles.dateText}>{chamadaDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={chamadaDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()} 
                    />
                )}

                {/* Lista de Estudantes */}
                <Text style={styles.listHeader}>Membros para chamada:</Text>
                <View style={styles.studentList}>
                    {members.map(member => {
                        const isPresent = presentUserIds.has(member.id);
                        return (
                            <TouchableOpacity 
                                key={member.id}
                                style={[styles.studentCard, isPresent && styles.studentCardPresent]}
                                onPress={() => togglePresence(member.id)}
                                disabled={isSubmitting}
                            >
                                <Image 
                                    source={{ uri: member.avatar ? `${baseApiUrl}${member.avatar}` : `${baseApiUrl}/img/escoteiro1.png` }} 
                                    style={[styles.studentPhoto, isPresent && styles.studentPhotoPresent]} 
                                />
                                <View style={styles.studentInfo}>
                                    <Text style={styles.studentName}>{member.name} {member.surname}</Text>
                                </View>
                                {isPresent && (
                                    <Ionicons name="checkmark-circle" size={30} color={COLORS.success} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Botão de Submissão (Apenas para Monitores) */}
                {userRole === 'MONITOR' && (
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmitChamada}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submeter Chamada ({presentUserIds.size} Presentes)</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: COLORS.bgPrimary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bgPrimary,
    },
    adminWidget: {
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 15,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    widgetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.scoutGreen,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
        paddingBottom: 5,
    },
    messageText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 5,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        gap: 10,
    },
    dateText: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    listHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 10,
    },
    studentList: {
        gap: 10,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: COLORS.bgSecondary,
        borderRadius: 12,
        borderLeftWidth: 5,
        borderLeftColor: COLORS.danger, 
        opacity: 0.7,
    },
    studentCardPresent: {
        borderLeftColor: COLORS.success, 
        opacity: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    studentPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        borderWidth: 3,
        borderColor: COLORS.borderColor,
    },
    studentPhotoPresent: {
        borderColor: COLORS.success,
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    submitButton: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: COLORS.scoutGreen,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.textSecondary,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});