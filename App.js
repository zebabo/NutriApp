import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useRef } from "react";
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

function Navigation() {
  const { session, hasProfile, isLoading } = useAuth();
  const navigationRef = useRef(null);
  const hasNavigated = useRef(false);

  // ✅ Reset flag quando session muda (logout/login)
  useEffect(() => {
    if (!session) {
      hasNavigated.current = false;
    }
  }, [session]);

  // ✅ Navegação automática - SÓ navega uma vez após login
  useEffect(() => {
    // Não fazer nada se estiver a carregar
    if (isLoading) {
      console.log("⏳ [Navigation] Aguardando isLoading...");
      return;
    }

    // Não fazer nada se não tiver navigationRef
    if (!navigationRef.current) {
      return;
    }

    const currentRoute = navigationRef.current.getCurrentRoute()?.name;

    console.log("🔍 [Navigation] Estado:", {
      session: !!session,
      hasProfile,
      currentRoute,
      hasNavigated: hasNavigated.current,
    });

    // Se não tem sessão e não está em Auth ou ResetPassword → ir para Auth
    if (
      !session &&
      currentRoute !== "Auth" &&
      currentRoute !== "ResetPassword"
    ) {
      console.log("➡️ [Navigation] Sem sessão → Auth");
      hasNavigated.current = false;
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: "Auth" }],
      });
      return;
    }

    // ✅ Se tem sessão, está em Auth, e ainda não navegou → navegar
    if (session && currentRoute === "Auth" && !hasNavigated.current) {
      hasNavigated.current = true; // Marcar que já navegou

      const target = hasProfile ? "Dashboard" : "Form";
      console.log(`➡️ [Navigation] Com sessão → ${target}`);

      navigationRef.current.reset({
        index: 0,
        routes: [{ name: target }],
      });
      return;
    }

    // ✅ Se está no Form mas já tem perfil → ir para Dashboard
    if (session && currentRoute === "Form" && hasProfile) {
      console.log("➡️ [Navigation] Tem perfil, saindo do Form → Dashboard");
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    }
  }, [session, hasProfile, isLoading]);

  // Loading screen
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

  // Determinar rota inicial
  const getInitialRoute = () => {
    if (!session) return "Auth";
    if (hasProfile) return "Dashboard";
    return "Form";
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        {/* Todas as screens disponíveis sempre */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
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
