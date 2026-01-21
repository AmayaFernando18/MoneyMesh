import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const StartScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {/* Background Decor */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <SafeAreaView style={styles.safeArea}>
                {/* Content Container */}
                <View style={styles.content}>

                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircleOuter}>
                            <View style={styles.logoCircleInner}>
                                <Text style={styles.logoText}>MM</Text>
                            </View>
                        </View>
                        <Text style={styles.appName}>MoneyMesh</Text>
                        <Text style={styles.tagline}>Track. Save. Succeed.</Text>
                    </View>

                    {/* Actions Section */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>

                        <View style={styles.signInContainer}>
                            <Text style={styles.signInText}>Already have account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.signInLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Decorative Indicator */}
                    <View style={styles.indicatorContainer}>
                        <View style={styles.indicator} />
                    </View>

                </View>
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
        top: -width * 0.2,
        left: -width * 0.2,
        width: width * 1.0,
        height: width * 1.0,
        borderRadius: width * 0.5,
        backgroundColor: '#2EC4B6',
        opacity: 0.1,
    },
    bgCircle2: {
        position: 'absolute',
        bottom: -width * 0.2,
        right: -width * 0.2,
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: '#FF9F1C',
        opacity: 0.05,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 60,
        paddingBottom: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    logoCircleOuter: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logoCircleInner: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    logoText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 18,
        fontWeight: '500',
        color: '#94A3B8',
    },
    actions: {
        width: '100%',
        paddingBottom: 20,
    },
    button: {
        width: '100%',
        backgroundColor: '#2EC4B6',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    signInLink: {
        color: '#2EC4B6',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    indicatorContainer: {
        alignItems: 'center',
        paddingBottom: 8,
    },
    indicator: {
        width: 128,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
    }
});

export default StartScreen;
