import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, Dimensions, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CardsScreen = ({ navigation }: any) => {
    const [cards, setCards] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newCard, setNewCard] = useState({ card_name: '', last4: '', credit_limit: '', current_balance: '0' });
    const [submitting, setSubmitting] = useState(false);

    const loadCards = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cards');
            setCards(res.data);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to load cards");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [])
    );

    const handleAddCard = async () => {
        try {
            if (!newCard.card_name || newCard.last4.length !== 4) return Alert.alert("Error", "Please check fields");
            setSubmitting(true);
            await api.post('/cards', {
                ...newCard,
                credit_limit: parseFloat(newCard.credit_limit) || 0,
                current_balance: parseFloat(newCard.current_balance) || 0
            });
            setModalVisible(false);
            setNewCard({ card_name: '', last4: '', credit_limit: '', current_balance: '0' });
            loadCards();
        } catch (e) {
            Alert.alert("Error", "Failed to add card");
        } finally {
            setSubmitting(false);
        }
    };

    const renderItem = ({ item, index }: any) => {
        // Alternate gradients for visual interest
        const gradients: [string, string, ...string[]][] = [
            ['#2EC4B6', '#0F172A'], // Teal -> Dark
            ['#FF9F1C', '#0F172A'], // Orange -> Dark
            ['#3B82F6', '#0F172A'], // Blue -> Dark
        ];
        const colors = gradients[index % gradients.length];
        const isDark = true;

        return (
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="nfc" size={32} color="rgba(255,255,255,0.6)" style={{ marginRight: 10 }} />
                            <MaterialIcons name="credit-card" size={24} color="rgba(255,255,255,0.8)" />
                        </View>
                        {item.utilization_warning && (
                            <View style={styles.warningBadge}>
                                <Text style={styles.warningText}>High Usage</Text>
                            </View>
                        )}
                        <Text style={styles.cardBank}>{item.card_name}</Text>
                    </View>

                    <View style={styles.chipRow}>
                        <View style={styles.simChip} />
                    </View>

                    <Text style={styles.cardNumber}>•••• •••• •••• {item.last4}</Text>

                    <View style={styles.cardFooter}>
                        <View>
                            <Text style={styles.footerLabel}>Balance</Text>
                            <Text style={styles.footerValue}>Rs. {parseFloat(item.current_balance).toFixed(2)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.footerLabel}>Limit</Text>
                            <Text style={styles.footerValue}>Rs. {parseFloat(item.credit_limit).toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.availableBar}>
                        <Text style={styles.availableText}>Available: Rs. {item.available_credit.toFixed(2)}</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {/* Background Decor */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
                        <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cards</Text>
                    <View style={{ width: 28 }} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2EC4B6" />
                    </View>
                ) : (
                    <FlatList
                        data={cards}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No cards added yet.</Text>
                            </View>
                        }
                    />
                )}

                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={30} color="#FFFFFF" />
                </TouchableOpacity>

                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add New Card</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Card Name (e.g. Visa Gold)"
                                placeholderTextColor="#94A3B8"
                                value={newCard.card_name}
                                onChangeText={t => setNewCard({ ...newCard, card_name: t })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Last 4 Digits"
                                placeholderTextColor="#94A3B8"
                                maxLength={4}
                                keyboardType="numeric"
                                value={newCard.last4}
                                onChangeText={t => setNewCard({ ...newCard, last4: t })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Credit Limit"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={newCard.credit_limit}
                                onChangeText={t => setNewCard({ ...newCard, credit_limit: t })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Current Balance"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={newCard.current_balance}
                                onChangeText={t => setNewCard({ ...newCard, current_balance: t })}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleAddCard} disabled={submitting}>
                                    {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Card</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    bgCircle1: {
        position: 'absolute',
        top: -width * 0.5,
        left: -width * 0.2,
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: '#2EC4B6',
        opacity: 0.1,
    },
    bgCircle2: {
        position: 'absolute',
        bottom: -width * 0.5,
        right: -width * 0.2,
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: '#FF9F1C',
        opacity: 0.05,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    menuButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 80,
    },
    cardContainer: {
        marginBottom: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        padding: 24,
        borderRadius: 20,
        minHeight: 200,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardBank: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    warningBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    warningText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: "bold"
    },
    chipRow: {
        marginVertical: 10,
    },
    simChip: {
        width: 50,
        height: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    cardNumber: {
        fontSize: 22,
        color: '#FFFFFF',
        letterSpacing: 2,
        fontFamily: 'monospace', // mimics credit card emboss font usually
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        marginVertical: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    footerLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    footerValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    availableBar: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    availableText: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.8,
        textAlign: 'right'
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF9F1C',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#2EC4B6',
        marginLeft: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default CardsScreen;
