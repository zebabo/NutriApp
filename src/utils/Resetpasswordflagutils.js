/**
 * 🔧 UTILITÁRIO DE EMERGÊNCIA
 *
 * Adiciona ao SettingsScreen para limpar flag manualmente
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const RESET_PASSWORD_FLAG = "@is_resetting_password";

/**
 * Limpa a flag de reset de password manualmente
 * Útil se a app ficar presa no ResetPassword
 */
export const clearResetPasswordFlag = async () => {
  try {
    await AsyncStorage.removeItem(RESET_PASSWORD_FLAG);

    if (global.setPasswordResetFlag) {
      await global.setPasswordResetFlag(false);
    }

    console.log("✅ [UTIL] Flag de reset limpa");

    Alert.alert(
      "Flag Limpa",
      "A flag de reset foi removida. Reinicia a app se necessário.",
      [{ text: "OK" }],
    );

    return true;
  } catch (error) {
    console.error("❌ [UTIL] Erro ao limpar flag:", error);
    Alert.alert("Erro", "Não foi possível limpar a flag.");
    return false;
  }
};

/**
 * Verifica o estado atual da flag
 */
export const checkResetPasswordFlag = async () => {
  try {
    const flag = await AsyncStorage.getItem(RESET_PASSWORD_FLAG);
    console.log("🔍 [UTIL] Flag atual:", flag);

    Alert.alert(
      "Estado da Flag",
      `Flag de reset: ${flag === "true" ? "ATIVA ⚠️" : "Inativa ✅"}`,
      [
        { text: "OK" },
        ...(flag === "true"
          ? [
              {
                text: "Limpar Flag",
                onPress: clearResetPasswordFlag,
                style: "destructive",
              },
            ]
          : []),
      ],
    );
  } catch (error) {
    console.error("❌ [UTIL] Erro ao verificar flag:", error);
  }
};
