import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function ResetPasswordScreen({ route, navigation }) {
    // Recebe o email vindo do AuthScreen
    const [email] = useState(route.params?.email || '');
    const [token, setToken] = useState(''); 
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false); // <--- Estado para bloquear a UI no sucesso

    const handleVerifyAndReset = async () => {
        if (token.length < 6 || newPassword.length < 6) {
            Alert.alert("Erro", "Introduz o código recebido e uma password com pelo menos 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            console.log("Tentando verificar OTP para:", email);
            
            // PASSO 1: Validar o código (OTP) 
            const { error: verifyError } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: token.trim(),
                type: 'recovery',
            });

            if (verifyError) {
                console.log("Erro no OTP:", verifyError.message);
                Alert.alert("Erro no Código", "O código introduzido é inválido ou expirou.");
                setLoading(false);
                return;
            }

            console.log("OTP validado! A atualizar password...");

            // PASSO 2: Atualizar a password
            const { error: updateError } = await supabase.auth.updateUser({ 
                password: newPassword 
            });

            if (updateError) {
                console.log("Erro no Update:", updateError.message);
                Alert.alert("Erro na Atualização", updateError.message);
                setLoading(false);
            } else {
                // SUCESSO: Ativamos o bloqueio visual para evitar o "flash" de outros ecrãs
                setIsFinished(true); 

                Alert.alert("Sucesso!", "A tua password foi alterada com sucesso.", [
                    { 
                      text: "OK", 
                      onPress: async () => {
                        // Fazemos Logout para limpar a sessão e o App.js voltar ao Auth automaticamente
                        await supabase.auth.signOut();
                      } 
                    }
                ]);
            }

        } catch (err) {
            console.error("Erro inesperado:", err);
            Alert.alert("Erro", "Ocorreu um erro ao processar o pedido.");
            setLoading(false);
        }
    };

    // Se a operação terminou com sucesso, mostramos um ecrã de carregamento limpo
    // Isso impede que o utilizador veja o FormScreen por milissegundos
    if (isFinished) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#32CD32" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Redefinir Password 🔐</Text>
                <Text style={styles.subtitle}>Introduz o código enviado para o teu e-mail.</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Código (Ex: 12345678)"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    value={token}
                    onChangeText={setToken}
                    autoFocus
                />

                <TextInput
                    style={styles.input}
                    placeholder="Nova Password"
                    placeholderTextColor="#666"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                <TouchableOpacity 
                    style={[styles.button, loading && { opacity: 0.7 }]} 
                    onPress={handleVerifyAndReset} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.buttonText}>CONFIRMAR ALTERAÇÃO</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.cancelText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    content: { flex: 1, justifyContent: 'center', padding: 25 },
    title: { fontSize: 26, color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
    subtitle: { color: '#666', textAlign: 'center', marginVertical: 20, fontSize: 15 },
    input: { 
        backgroundColor: '#1E1E1E', 
        color: '#FFF', 
        padding: 18, 
        borderRadius: 12, 
        marginBottom: 15, 
        fontSize: 16,
        borderWidth: 1, 
        borderColor: '#333' 
    },
    button: { 
        backgroundColor: '#32CD32', 
        padding: 18, 
        borderRadius: 12, 
        alignItems: 'center', 
        marginTop: 10 
    },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { marginTop: 20, alignItems: 'center' },
    cancelText: { color: '#666', fontSize: 14 }
});