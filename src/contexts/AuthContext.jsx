import * as Notifications from 'expo-notifications';
import { createContext, useEffect, useRef, useState } from 'react';
import {
  checkUserProfile,
  onAuthStateChange,
  verifySessionAndProfile,
} from '../services/authService';
import {
  registerForPushNotificationsAsync,
  scheduleWaterReminder,
} from '../services/notificationService';

/**
 * Context para gestão de autenticação
 */
export const AuthContext = createContext({
  session: null,
  hasProfile: false,
  isLoading: true,
  user: null,
  refreshProfile: async () => {},
});

/**
 * Provider de Autenticação
 * Gere o estado de autenticação de toda a aplicação
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Referências para as subscrições de notificações
  const notificationListener = useRef();
  const responseListener = useRef();

  // Função para refrescar o estado do perfil
  const refreshProfile = async () => {
    console.log("🔄 [AuthContext] refreshProfile chamado");
    
    if (!session?.user?.id) {
      console.log("⚠️ [AuthContext] Sem sessão, definindo hasProfile = false");
      setHasProfile(false);
      return;
    }

    console.log("🔍 [AuthContext] A verificar perfil para userId:", session.user.id);
    const { hasProfile: profileExists } = await checkUserProfile(session.user.id);
    console.log("📊 [AuthContext] Resultado checkUserProfile:", profileExists);
    
    setHasProfile(profileExists);
    console.log("✅ [AuthContext] hasProfile atualizado para:", profileExists);
  };

  // Setup inicial
  useEffect(() => {
    // --- SETUP DE NOTIFICAÇÕES ---
    const setupNotifications = async () => {
      await registerForPushNotificationsAsync();
      await scheduleWaterReminder();
    };
    setupNotifications();

    // Listeners de notificações
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notificação recebida:", notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 Interação com notificação detectada");
      }
    );

    // --- VERIFICAR SESSÃO INICIAL ---
    const initAuth = async () => {
      const { session: currentSession, hasProfile: profileExists } = 
        await verifySessionAndProfile();
      
      setSession(currentSession);
      setHasProfile(profileExists);
      setIsLoading(false);
    };

    initAuth();

    // --- SUBSCREVER A MUDANÇAS DE AUTH ---
    const authSubscription = onAuthStateChange(async (event, newSession) => {
      console.log("🔐 Auth event:", event);

      setSession(newSession);

      // Verificar perfil quando há sessão
      if (newSession) {
        const { hasProfile: profileExists } = await checkUserProfile(newSession.user.id);
        setHasProfile(profileExists);
      } else {
        setHasProfile(false);
      }

      setIsLoading(false);
    });

    // --- CLEANUP ---
    return () => {
      authSubscription.unsubscribe();

      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Valores disponíveis no contexto
  const value = {
    session,
    hasProfile,
    isLoading,
    user: session?.user || null,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};