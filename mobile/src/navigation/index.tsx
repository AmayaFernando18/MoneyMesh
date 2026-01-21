import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import CardsScreen from '../screens/CardsScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import { useAuth } from '../context/AuthContext';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
                <ActivityIndicator size="large" color="#2EC4B6" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {token ? (
                <AppStack.Navigator screenOptions={{ headerShown: false }}>
                    <AppStack.Screen name="Home" component={HomeScreen} />
                    <AppStack.Screen name="Cards" component={CardsScreen} />
                    <AppStack.Screen name="AddTransaction" component={AddTransactionScreen} />
                    <AppStack.Screen name="Categories" component={CategoryScreen} />
                    <AppStack.Screen name="Transactions" component={TransactionsScreen} />
                </AppStack.Navigator>
            ) : (
                <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Start">
                    <AuthStack.Screen name="Start" component={StartScreen} />
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({});
