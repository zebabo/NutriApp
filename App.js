import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuth } from './src/hooks/useAuth';

// Telas
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FormScreen from './src/screens/FormScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

/**
 * Componente de navegação
 * Decide qual stack mostrar baseado no estado de autenticação
 */
function Navigation() {
  const { session, hasProfile, isLoading } = useAuth();
  const navigationRef = useRef(null);

  // Monitorar mudanças em hasProfile e navegar automaticamente
  useEffect(() => {
    console.log("🔍 [Navigation] Estado mudou - session:", !!session, "hasProfile:", hasProfile, "isLoading:", isLoading);
    
    if (!isLoading && session && hasProfile && navigationRef.current) {
      console.log("✅ [Navigation] hasProfile é true! A navegar para Dashboard...");
      
      // Dar um pequeno delay para garantir que a navegação está pronta
      setTimeout(() => {
        try {
          navigationRef.current?.navigate('Dashboard');
          console.log("✅ [Navigation] Navegação para Dashboard executada!");
        } catch (error) {
          console.error("❌ [Navigation] Erro ao navegar:", error);
        }
      }, 100);
    }
  }, [session, hasProfile, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={!session ? "Auth" : (hasProfile ? "Dashboard" : "Form")}
      >
        {!session ? (
          // Stack de autenticação (utilizador não está logado)
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          // Stack principal (utilizador está logado)
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Form" component={FormScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Recipes" component={RecipesScreen} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * Componente principal da aplicação
 * Envolve tudo com o AuthProvider
 */
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}