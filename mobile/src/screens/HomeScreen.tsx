import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
    const { user, signOut } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/transactions');
            const txs = response.data || [];
            setTransactions(txs);

            const income = txs
                .filter((t: any) => t.type === 'income')
                .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

            const expense = txs
                .filter((t: any) => t.type === 'expense')
                .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

            setSummary({
                income,
                expense,
                balance: income - expense
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            // Silent fail on dashboard refresh usually better than alert loop, but can toast
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData();
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDashboardData();
        });
        return unsubscribe;
    }, [navigation]);

    const renderTransactionItem = ({ item }: { item: any }) => (
        <View style={styles.transactionItem}>
            <View style={styles.iconContainer}>
                <MaterialIcons
                    name={item.type === 'income' ? 'arrow-downward' : 'arrow-upward'}
                    size={24}
                    color={item.type === 'income' ? '#2EC4B6' : '#FF9F1C'}
                />
            </View>
            <View style={styles.txDetails}>
                <Text style={styles.txCategory}>{item.category || 'General'}</Text>
                <Text style={styles.txDate}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'income' ? '#2EC4B6' : '#EF4444' }]}>
                {item.type === 'income' ? '+' : '-'}Rs. {Number(item.amount).toFixed(2)}
            </Text>
        </View>
    );

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', onPress: signOut, style: 'destructive' }
        ]);
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
                    <View>
                        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}!</Text>
                        <Text style={styles.welcomeDate}>Welcome Back</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Cards')} style={styles.iconButton}>
                            <Ionicons name="card" size={24} color="#FF9F1C" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                            <MaterialIcons name="logout" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Balance Card - Glass Effect */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>Rs. {summary.balance.toFixed(2)}</Text>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <View style={[styles.arrowIcon, { backgroundColor: 'rgba(46, 196, 182, 0.2)' }]}>
                                <MaterialIcons name="arrow-downward" size={20} color="#2EC4B6" />
                            </View>
                            <View>
                                <Text style={styles.summaryLabel}>Income</Text>
                                <Text style={styles.summaryValue}>+Rs. {summary.income.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summaryItem}>
                            <View style={[styles.arrowIcon, { backgroundColor: 'rgba(255, 159, 28, 0.2)' }]}>
                                <MaterialIcons name="arrow-upward" size={20} color="#FF9F1C" />
                            </View>
                            <View>
                                <Text style={styles.summaryLabel}>Expense</Text>
                                <Text style={styles.summaryValue}>-Rs. {summary.expense.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AddTransaction')}>
                        <Text style={styles.seeAll}>+ Add New</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={transactions}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item: any) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No transactions yet.</Text>
                        </View>
                    }
                />

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark background for glass pop
    },
    bgCircle1: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: '#2EC4B6',
        opacity: 0.1,
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
        top: width * 0.2,
        right: -width * 0.3,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    welcomeDate: {
        fontSize: 14,
        color: '#94A3B8',
    },
    iconButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        // "backdropFilter" isn't native, we use opacity/color for mimic
    },
    balanceLabel: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    arrowIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 16,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#94A3B8',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    seeAll: {
        fontSize: 14,
        color: '#2EC4B6',
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 100,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    txDetails: {
        flex: 1,
    },
    txCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    txDate: {
        fontSize: 12,
        color: '#94A3B8',
    },
    txAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#94A3B8',
    }
});

export default HomeScreen;
