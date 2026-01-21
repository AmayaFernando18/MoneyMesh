import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TransactionsScreen = ({ navigation }: any) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const getIconForCategory = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('food') || cat.includes('restaurant')) return 'utensils';
        if (cat.includes('transport') || cat.includes('gas') || cat.includes('uber')) return 'car';
        if (cat.includes('shop') || cat.includes('cloth')) return 'shopping-bag';
        if (cat.includes('bill') || cat.includes('util')) return 'file-invoice-dollar';
        if (cat.includes('salary') || cat.includes('income')) return 'money-bill-wave';
        if (cat.includes('entertain') || cat.includes('movie')) return 'film';
        if (cat.includes('health') || cat.includes('doctor')) return 'medkit';
        return 'receipt'; // default
    };

    const renderTransactionItem = ({ item }: any) => {
        const isExpense = item.type === 'expense';
        const iconName = getIconForCategory(item.category);

        return (
            <View style={styles.transactionItemWrapper}>
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
                    style={styles.transactionItem}
                >
                    <View style={[styles.iconContainer, { backgroundColor: isExpense ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
                        <FontAwesome5
                            name={iconName}
                            size={18}
                            color={isExpense ? '#FF6B6B' : '#2EC4B6'}
                        />
                    </View>

                    <View style={styles.transactionDetails}>
                        <Text style={styles.transactionCategory}>{item.category}</Text>
                        <Text style={styles.transactionDate}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
                        {item.payment_method && <Text style={styles.paymentMethod}>{item.payment_method}</Text>}
                    </View>

                    <Text style={[styles.transactionAmount, { color: isExpense ? '#FF6B6B' : '#2EC4B6' }]}>
                        {isExpense ? '-' : '+'} Rs. {Number(item.amount).toFixed(2)}
                    </Text>
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
                    <Text style={styles.headerTitle}>Transactions</Text>
                    <TouchableOpacity style={styles.addButtonHeader} onPress={() => navigation.navigate('AddTransaction')}>
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2EC4B6" />
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={renderTransactionItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No transactions found</Text>
                                <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('AddTransaction')}>
                                    <Text style={styles.emptyButtonText}>Add Your First Transaction</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
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
        opacity: 0.05,
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
    addButtonHeader: {
        padding: 5,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
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
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    transactionItemWrapper: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionCategory: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    transactionDate: {
        color: '#94A3B8',
        fontSize: 12,
    },
    paymentMethod: {
        color: '#94A3B8',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 2,
        textTransform: 'capitalize'
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 16,
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#2EC4B6',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});

export default TransactionsScreen;
