import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../services/supabase';

export default function AuthScreen({ navigation }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);

 const handleForgotPassword = async () => {
    if (!email) {
        Alert.alert("Erro", "Por favor, introduz o teu e-mail primeiro.");
        return;
    }
    setLoading(true);

    // O Supabase envia o código (Token) para o e-mail
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    setLoading(false);

    if (error) {
        Alert.alert("Erro", error.message);
    } else {
        Alert.alert(
            "Código Enviado", 
            "Verifica o teu e-mail. Introduz o código de 6 dígitos no próximo ecrã."
        );
        // Navega para o ResetPassword passando o e-mail para não ter de digitar de novo
        navigation.navigate('ResetPassword', { email: email.trim() });
    }
};
    const handleAuth = async () => {
        if (!email.includes('@') || password.length < 6) {
            Alert.alert("Erro", "Introduz um e-mail válido e uma password com pelo menos 6 caracteres.");
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert("Erro", "As passwords não coincidem.");
            return;
        }

        setLoading(true);

        if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase().trim(),
                password: password,
            });

            if (error) {
                Alert.alert("Erro no Login", "E-mail ou password incorretos.");
                setLoading(false);
            } else {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                setLoading(false);
                navigation.replace(profile ? 'Dashboard' : 'Form');
            }
        } else {
            if (!nome) {
                Alert.alert("Erro", "Por favor, introduz o teu nome.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: Linking.createURL('/dashboard'), 
                    data: { full_name: nome }
                }
            });

            setLoading(false);

            if (error) {
                if (error.status === 422 || error.message.includes("already registered")) {
                    Alert.alert("E-mail em uso", "Este e-mail já está associado a uma conta. Tenta fazer login.");
                } else {
                    Alert.alert("Erro no Registo", error.message);
                }
            } else {
                if (data.user?.identities?.length === 0) {
                    Alert.alert("E-mail em uso", "Este e-mail já está associado a uma conta.");
                } else {
                    Alert.alert(
                        "Sucesso!", 
                        "Verifica a tua caixa de entrada para confirmar o e-mail.",
                        [{ text: "OK", onPress: () => setIsLogin(true) }]
                    );
                }
            }
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerArea}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="flash" size={40} color="#32CD32" />
                    </View>
                    <Text style={styles.title}>{isLogin ? 'Bem-vindo de volta' : 'Criar conta'}</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Continua a tua jornada fitness.' : 'Começa hoje a transformar o teu corpo.'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Nome Completo" 
                                placeholderTextColor="#666"
                                value={nome}
                                onChangeText={setNome}
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="E-mail" 
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Password" 
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {isLogin && (
                        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>Esqueci-me da password</Text>
                        </TouchableOpacity>
                    )}

                    {!isLogin && (
                        <View style={styles.inputContainer}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Confirmar Password" 
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    )}

                    <TouchableOpacity 
                        style={[styles.mainBtn, loading && { backgroundColor: '#1b5e20' }]} 
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.mainBtnText}>{isLogin ? 'ENTRAR' : 'REGISTAR'}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.switchBtn} 
                        onPress={() => {
                            setIsLogin(!isLogin);
                            setConfirmPassword('');
                        }}
                    >
                        <Text style={styles.switchText}>
                            {isLogin ? 'Não tens conta? ' : 'Já tens conta? '}
                            <Text style={{ color: '#32CD32', fontWeight: 'bold' }}>
                                {isLogin ? 'Regista-te' : 'Faz Login'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 25 },
    headerArea: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { 
        width: 80, height: 80, borderRadius: 40, 
        backgroundColor: '#1E1E1E', justifyContent: 'center', 
        alignItems: 'center', marginBottom: 20,
        borderWidth: 1, borderColor: '#333'
    },
    title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
    subtitle: { color: '#666', fontSize: 15, marginTop: 8, textAlign: 'center' },
    form: { width: '100%' },
    inputContainer: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: '#1E1E1E', borderRadius: 15, 
        marginBottom: 15, paddingHorizontal: 15, height: 60,
        borderWidth: 1, borderColor: '#333'
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: '#FFF', fontSize: 16 },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginRight: 5 },
    forgotText: { color: '#32CD32', fontSize: 13 },
    mainBtn: { 
        backgroundColor: '#32CD32', height: 60, borderRadius: 15, 
        justifyContent: 'center', alignItems: 'center',
        marginTop: 10,
        shadowColor: '#32CD32', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 8
    },
    mainBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    switchBtn: { marginTop: 25, alignItems: 'center' },
    switchText: { color: '#666', fontSize: 14 }
});