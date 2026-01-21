import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

const { width } = Dimensions.get('window');

const AddTransactionScreen = ({ navigation }: any) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cardId, setCardId] = useState('');
    const [description, setDescription] = useState('');
    const [cards, setCards] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load cards and categories
        const fetchData = async () => {
            try {
                const [cardsRes, catsRes] = await Promise.all([
                    api.get('/cards'),
                    api.get('/categories')
                ]);
                setCards(cardsRes.data);
                setCategories(catsRes.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!amount || !category) {
            Alert.alert("Error", "Amount and Category are required");
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                type,
                amount: parseFloat(amount),
                category,
                payment_method: paymentMethod,
                date: new Date().toISOString(),
                description
            };

            if (paymentMethod === 'credit' && cardId) {
                payload.card_id = cardId;
            } else if (paymentMethod === 'credit' && !cardId) {
                Alert.alert("Error", "Please select a card for credit payment");
                setLoading(false);
                return;
            }

            await api.post('/transactions', payload);
            Alert.alert("Success", "Transaction Added");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", "Failed to add transaction");
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {/* Background Decor */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
                        <MaterialIcons name="arrow-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Transaction</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Categories')} style={styles.menuButton}>
                        <MaterialIcons name="category" size={28} color="#2EC4B6" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Type Toggle */}
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'expense' && styles.activeTypeExpense]}
                            onPress={() => { setType('expense'); setCategory(''); }}
                        >
                            <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'income' && styles.activeTypeIncome]}
                            onPress={() => { setType('income'); setCategory(''); }}
                        >
                            <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>Income</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>

                    {/* Category Selection */}
                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={styles.label}>Category</Text>
                            <TouchableOpacity onPress={() => { setLoading(true); api.get('/categories').then(r => { setCategories(r.data); setLoading(false) }); }}>
                                <MaterialIcons name="refresh" size={20} color="#2EC4B6" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {filteredCategories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        category === cat.name && (type === 'income' ? styles.activeChipIncome : styles.activeChipExpense)
                                    ]}
                                    onPress={() => setCategory(cat.name)}
                                >
                                    <Text style={[styles.categoryText, category === cat.name && styles.activeCategoryText]}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                            {filteredCategories.length === 0 && (
                                <Text style={styles.noCatsText}>No categories found. Tap icon above to manage.</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Payment Method</Text>
                        <View style={styles.methodContainer}>
                            {['cash', 'debit', 'credit', 'bank_transfer'].map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.methodChip, paymentMethod === m && styles.activeMethodChip]}
                                    onPress={() => setPaymentMethod(m)}
                                >
                                    <Text style={[styles.methodText, paymentMethod === m && styles.activeMethodText]}>
                                        {m.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {paymentMethod === 'credit' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Select Card</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {cards.map(c => (
                                    <TouchableOpacity
                                        key={c.id}
                                        style={[styles.cardChip, cardId === c.id && styles.activeMethodChip]}
                                        onPress={() => setCardId(c.id)}
                                    >
                                        <Text style={[styles.methodText, cardId === c.id && styles.activeMethodText]}>
                                            {c.card_name} (*{c.last4})
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Note..."
                            placeholderTextColor="#94A3B8"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Transaction</Text>}
                    </TouchableOpacity>

                </ScrollView>
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
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: '#2EC4B6',
        opacity: 0.05,
        top: -width * 0.5,
        left: -width * 0.2,
    },
    bgCircle2: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: '#FF9F1C',
        opacity: 0.08,
        bottom: 0,
        right: -width * 0.3,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginVertical: 20,
    },
    menuButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 25,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTypeExpense: {
        backgroundColor: '#EF4444',
    },
    activeTypeIncome: {
        backgroundColor: '#2EC4B6',
    },
    typeText: {
        color: '#94A3B8',
        fontWeight: '600',
    },
    activeTypeText: {
        color: '#FFFFFF',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        fontSize: 16,
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    activeChipIncome: {
        backgroundColor: '#2EC4B6',
        borderColor: '#2EC4B6',
    },
    activeChipExpense: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    categoryText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    activeCategoryText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    noCatsText: {
        color: '#64748B',
        fontStyle: 'italic',
    },
    methodContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    methodChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginRight: 10,
    },
    activeMethodChip: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    methodText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
    },
    activeMethodText: {
        color: '#FFFFFF',
    },
    saveButton: {
        backgroundColor: '#2EC4B6',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AddTransactionScreen;
