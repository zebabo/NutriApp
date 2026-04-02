import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { AuthButton } from "../components/Auth/AuthButton";
import { AuthHeader } from "../components/Auth/AuthHeader";
import { AuthInput } from "../components/Auth/AuthInput";
import { PasswordStrength } from "../components/Auth/PasswordStrength";
import { useAuthForm } from "../hooks/useAuthForm";
import { COLORS } from "../utils/theme";

export default function AuthScreen({ navigation }) {
  const {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    nome,
    setNome,
    showPassword,
    showConfirmPassword,
    passwordStrength,
    isLoggingIn,
    isSigningUp,
    isSendingReset,
    isLoading,
    isLockedOut,
    lockoutTime,
    handleAuth,
    handleForgotPassword,
    toggleMode,
    toggleShowPassword,
    toggleShowConfirmPassword,
    isLogin,
    canSubmit,
  } = useAuthForm(navigation);

  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const nomeRef = useRef();

  useEffect(() => {}, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader
            title={isLogin ? "Bem-vindo de volta" : "Criar conta"}
            subtitle={
              isLogin
                ? "Continua a tua jornada fitness."
                : "Começa hoje a transformar o teu corpo."
            }
          />
          <View style={styles.form}>
            {!isLogin && (
              <AuthInput
                ref={nomeRef}
                icon="person-outline"
                placeholder="Nome Completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                textContentType="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            )}
            <AuthInput
              ref={emailRef}
              icon="mail-outline"
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <AuthInput
              ref={passwordRef}
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType={isLogin ? "password" : "newPassword"}
              returnKeyType={isLogin ? "done" : "next"}
              onSubmitEditing={
                isLogin ? handleAuth : () => confirmPasswordRef.current?.focus()
              }
              rightIcon={
                <TouchableOpacity onPress={toggleShowPassword}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              }
            />
            {!isLogin && password.length > 0 && (
              <PasswordStrength
                password={password}
                strength={passwordStrength}
              />
            )}
            {isLogin && (
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotBtn}
                disabled={isSendingReset}
              >
                <Text style={styles.forgotText}>Esqueci-me da password</Text>
              </TouchableOpacity>
            )}
            {!isLogin && (
              <AuthInput
                ref={confirmPasswordRef}
                icon="checkmark-circle-outline"
                placeholder="Confirmar Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleAuth}
                rightIcon={
                  <TouchableOpacity onPress={toggleShowConfirmPassword}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                }
              />
            )}
            {isLockedOut && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#FF6B6B" />
                <Text style={styles.warningText}>
                  Demasiadas tentativas. Aguarda {lockoutTime}s
                </Text>
              </View>
            )}
            <AuthButton
              title={isLogin ? "ENTRAR" : "REGISTAR"}
              onPress={handleAuth}
              loading={isLoggingIn || isSigningUp}
              disabled={!canSubmit() || isLockedOut}
            />
            <TouchableOpacity
              style={styles.switchBtn}
              onPress={toggleMode}
              disabled={isLoading}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Não tens conta? " : "Já tens conta? "}
                <Text style={styles.switchTextHighlight}>
                  {isLogin ? "Regista-te" : "Faz Login"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.textInverse },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 25 },
  form: { width: "100%" },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 20, marginRight: 5 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  warningText: { color: "#FF6B6B", fontSize: 13, fontWeight: "600" },
  switchBtn: { marginTop: 25, alignItems: "center" },
  switchText: { color: COLORS.textSecondary, fontSize: 14 },
  switchTextHighlight: { color: COLORS.primary, fontWeight: "bold" },
});
