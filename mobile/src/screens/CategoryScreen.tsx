import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

const { width } = Dimensions.get('window');

const CategoryScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [adding, setAdding] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        setAdding(true);
        try {
            const res = await api.post('/categories', { name: newCategory, type });
            setCategories([...categories, res.data]);
            setNewCategory('');
        } catch (error) {
            Alert.alert('Error', 'Failed to add category');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteCategory = async (id: number, isDefault: boolean) => {
        if (isDefault) {
            Alert.alert('Cannot Delete', 'Default categories cannot be deleted.');
            return;
        }

        Alert.alert('Delete Category', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/categories/${id}`);
                        setCategories(categories.filter(c => c.id !== id));
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete category');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemIcon}>
                <MaterialIcons
                    name={item.type === 'income' ? 'arrow-downward' : 'arrow-upward'}
                    size={20}
                    color={item.type === 'income' ? '#2EC4B6' : '#FF9F1C'}
                />
            </View>
            <Text style={styles.itemText}>{item.name}</Text>
            {!item.is_default && (
                <TouchableOpacity onPress={() => handleDeleteCategory(item.id, item.is_default)}>
                    <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            )}
        </View>
    );

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
                    <Text style={styles.headerTitle}>Categories</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Add Category Form */}
                <View style={styles.formCard}>
                    <Text style={styles.cardTitle}>Add New Category</Text>
                    <View style={styles.typeSelector}>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'expense' && styles.activeTypeExpense]}
                            onPress={() => setType('expense')}
                        >
                            <Text style={[styles.typeText, type === 'expense' && styles.activeTypeText]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, type === 'income' && styles.activeTypeIncome]}
                            onPress={() => setType('income')}
                        >
                            <Text style={[styles.typeText, type === 'income' && styles.activeTypeText]}>Income</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Category Name"
                            placeholderTextColor="#94A3B8"
                            value={newCategory}
                            onChangeText={setNewCategory}
                        />
                        <TouchableOpacity
                            style={[styles.addButton, adding && { opacity: 0.7 }]}
                            onPress={handleAddCategory}
                            disabled={adding}
                        >
                            {adding ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <MaterialIcons name="add" size={24} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#2EC4B6" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
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
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: '#2EC4B6',
        opacity: 0.05,
        top: -width * 0.6,
        left: -width * 0.3,
    },
    bgCircle2: {
        position: 'absolute',
        width: width * 1.0,
        height: width * 1.0,
        borderRadius: width * 0.5,
        backgroundColor: '#FF9F1C',
        opacity: 0.05,
        bottom: -width * 0.2,
        right: -width * 0.3,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 15,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTypeExpense: {
        backgroundColor: '#FF9F1C',
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
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    addButton: {
        width: 50,
        backgroundColor: '#2EC4B6',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 15,
        borderRadius: 16,
        marginBottom: 10,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default CategoryScreen;
