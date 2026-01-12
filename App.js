import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from './src/services/supabase';

// Telas
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FormScreen from './src/screens/FormScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Importa os teus serviços de notificação
import { registerForPushNotificationsAsync, scheduleWaterReminder } from './src/services/notificationService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  
  // Referências para guardar as subscrições
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // --- LÓGICA DE NOTIFICAÇÕES ---
    const setupNotifications = async () => {
      await registerForPushNotificationsAsync();
      await scheduleWaterReminder(); 
    };
    setupNotifications();

    // Listener para quando a notificação chega (App aberta)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 Notificação recebida:", notification);
    });

    // Listener para quando o utilizador clica na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("👆 Interação com notificação detectada");
    });

    // --- LÓGICA DE AUTH ---
    verificarSessaoEPerfil();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth event:", event); // Para debug
      
      setSession(session);
      
      // CORREÇÃO: Verifica perfil sempre que houver sessão
      if (session) {
        await checarPerfilExistente(session.user.id);
      } else {
        setHasProfile(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
      
      // Remover subscrições corretamente
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  async function verificarSessaoEPerfil() {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) await checarPerfilExistente(session.user.id);
    setIsLoading(false);
  }

  async function checarPerfilExistente(userId) {
    try {
      console.log("🔍 Verificando perfil para userId:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      console.log("📊 Resultado da query:", { data, error });
      
      if (error) {
        console.error("❌ Erro ao buscar perfil:", error);
        setHasProfile(false);
        return;
      }
      
      const temPerfil = !!data;
      console.log("✅ Tem perfil?", temPerfil);
      setHasProfile(temPerfil);
      
    } catch (error) {
      console.error("❌ Exceção ao verificar perfil:", error);
      setHasProfile(false);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={!session ? "Auth" : (hasProfile ? "Dashboard" : "Form")}
      >
        {!session ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        ) : (
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