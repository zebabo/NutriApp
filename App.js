import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { useAuth } from "./src/hooks/useAuth";

// Telas
import AuthScreen from "./src/screens/AuthScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import FormScreen from "./src/screens/FormScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import RecipeDetailScreen from "./src/screens/RecipeDetailScreen";
import RecipesScreen from "./src/screens/RecipesScreen";
import ResetPasswordScreen from "./src/screens/ResetPasswordScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const RESET_PASSWORD_FLAG = "@is_resetting_password";

function Navigation() {
  const { session, hasProfile, isLoading } = useAuth();
  const navigationRef = useRef(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const lastNavigatedScreen = useRef(null);

  // Verificar flag ao montar
  useEffect(() => {
    const checkResetFlag = async () => {
      const flag = await AsyncStorage.getItem(RESET_PASSWORD_FLAG);
      if (flag === "true") {
        console.log("⚠️ [App] Flag de reset detectada");
        setIsResettingPassword(true);
      }
    };
    checkResetFlag();
  }, []);

  // Função global para controlar flag
  useEffect(() => {
    global.setPasswordResetFlag = async (value) => {
      console.log(`🔧 [App] setPasswordResetFlag(${value})`);
      setIsResettingPassword(value);
      await AsyncStorage.setItem(RESET_PASSWORD_FLAG, value ? "true" : "false");
    };

    return () => {
      delete global.setPasswordResetFlag;
    };
  }, []);

  // Listener para detectar mudanças de tela
  const onNavigationStateChange = (state) => {
    if (!state) return;

    const currentRoute = state.routes[state.index];
    console.log(`🔍 [Navigation] State change: ${currentRoute?.name}`);

    // ✅ FIX: Atualizar lastNavigatedScreen quando navega para Auth
    if (currentRoute?.name === "Auth") {
      console.log(
        "🔄 [Navigation] Voltou para Auth - resetando lastNavigatedScreen",
      );
      lastNavigatedScreen.current = "Auth";
    }

    // Bloquear navegação durante reset
    if (isResettingPassword && currentRoute?.name !== "ResetPassword") {
      console.log(`🚫 [Navigation] BLOQUEANDO ${currentRoute?.name}`);

      setImmediate(() => {
        if (navigationRef.current && isResettingPassword) {
          try {
            navigationRef.current.navigate("ResetPassword");
            console.log("✅ [Navigation] Forçado ResetPassword");
          } catch (e) {
            console.error("❌ [Navigation] Erro:", e);
          }
        }
      });
    }
  };

  // Navegar explicitamente quando session/hasProfile mudam
  useEffect(() => {
    console.log("🔍 [Navigation] Estado mudou:", {
      session: !!session,
      hasProfile,
      isLoading,
      isResettingPassword,
      lastScreen: lastNavigatedScreen.current,
    });

    // Ignorar se está em loading ou se flag está ativa
    if (isLoading || isResettingPassword) {
      console.log("⏸️ [Navigation] Aguardando (loading ou bloqueado)");
      return;
    }

    // Determinar qual screen deve estar ativa
    let targetScreen = null;

    if (!session) {
      targetScreen = "Auth";
    } else if (hasProfile) {
      targetScreen = "Dashboard";
    } else {
      targetScreen = "Form";
    }

    console.log(
      `🎯 [Navigation] Target screen: ${targetScreen}, Current: ${lastNavigatedScreen.current}`,
    );

    // Só navegar se o screen atual for diferente do target
    if (
      targetScreen &&
      targetScreen !== lastNavigatedScreen.current &&
      navigationRef.current
    ) {
      console.log(`➡️ [Navigation] NAVEGANDO para ${targetScreen}...`);

      setTimeout(() => {
        if (navigationRef.current) {
          try {
            navigationRef.current.navigate(targetScreen);
            lastNavigatedScreen.current = targetScreen;
            console.log(`✅ [Navigation] Navegado para ${targetScreen}`);
          } catch (error) {
            console.error(
              `❌ [Navigation] Erro ao navegar para ${targetScreen}:`,
              error,
            );
          }
        }
      }, 500);
    }
  }, [session, hasProfile, isLoading, isResettingPassword]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#121212",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  // Determinar initialRouteName baseado no estado atual
  const getInitialRoute = () => {
    if (!session) return "Auth";
    if (hasProfile) return "Dashboard";
    return "Form";
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={onNavigationStateChange}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        {/* SEMPRE renderizar TODAS as screens */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Recipes" component={RecipesScreen} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
