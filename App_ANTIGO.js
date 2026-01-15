import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
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
 */
function Navigation() {
  const { session, hasProfile, isLoading } = useAuth();
  const navigationRef = useRef(null);
  const [justResetPassword, setJustResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [checkingFlags, setCheckingFlags] = useState(true);

  // Verificar flags SEMPRE que session mudar
  useEffect(() => {
    const checkFlags = async () => {
      try {
        const justResetFlag = await AsyncStorage.getItem('just_reset_password');
        const isResettingFlag = await AsyncStorage.getItem('is_resetting_password');
        
        console.log('🔍 [App] Verificando flags:', {
          justReset: justResetFlag,
          isResetting: isResettingFlag,
          hasSession: !!session,
          hasProfile
        });
        
        if (isResettingFlag === 'true') {
          console.log('⏳ [App] Reset em progresso, ignorando session...');
          setIsResettingPassword(true);
          setJustResetPassword(false);
        } else if (justResetFlag === 'true') {
          console.log('✅ [App] Reset completo! Forçando ir para Auth...');
          setJustResetPassword(true);
          setIsResettingPassword(false);
          // Limpar flag depois de processar
          await AsyncStorage.removeItem('just_reset_password');
        } else {
          console.log('ℹ️ [App] Sem flags de reset');
          setJustResetPassword(false);
          setIsResettingPassword(false);
        }
      } catch (error) {
        console.error('❌ [App] Erro ao verificar flags:', error);
        setJustResetPassword(false);
        setIsResettingPassword(false);
      } finally {
        setCheckingFlags(false);
      }
    };

    checkFlags();
  }, [session, hasProfile]); // Re-verificar quando session ou hasProfile mudar!

  // Loading state
  if (isLoading || checkingFlags) {
    console.log('⏳ [App] Loading...', { isLoading, checkingFlags });
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  // Durante reset, mostrar loading
  if (isResettingPassword) {
    console.log('⏳ [App] Reset em progresso, mostrando loading...');
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  // FORÇAR ir para Auth se acabou de fazer reset
  const shouldShowAuth = !session || justResetPassword;

  console.log("🔍 [App] Decisão de navegação:", {
    hasSession: !!session,
    hasProfile,
    justResetPassword,
    isResettingPassword,
    shouldShowAuth,
    willShow: shouldShowAuth ? 'AUTH' : (hasProfile ? 'DASHBOARD' : 'FORM')
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        key={shouldShowAuth ? 'unauthenticated' : 'authenticated'}
        screenOptions={{ headerShown: false }}
        initialRouteName={shouldShowAuth ? "Auth" : (hasProfile ? "Dashboard" : "Form")}
      >
        {shouldShowAuth ? (
          // Stack de autenticação
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
          // Stack principal
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
 * Componente principal
 */
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}