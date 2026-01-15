import * as Notifications from 'expo-notifications';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  checkUserProfile,
  onAuthStateChange,
  verifySessionAndProfile,
} from '../services/authService';
import {
  registerForPushNotificationsAsync,
  scheduleWaterReminder,
} from '../services/notificationService';
import { supabase } from '../services/supabase';

/**
 * Context para gestão de autenticação
 */
export const AuthContext = createContext({
  session: null,
  hasProfile: false,
  isLoading: true,
  isSigningOut: false,
  user: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

/**
 * Provider de Autenticação
 * Gere o estado de autenticação de toda a aplicação
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Referências para as subscrições de notificações
  const notificationListener = useRef();
  const responseListener = useRef();

  // Função para refrescar o estado do perfil
  const refreshProfile = useCallback(async () => {
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
  }, [session]);

  // Função de signOut centralizada
  const signOut = useCallback(async () => {
    console.log("🚪 [AuthContext] signOut chamado - iniciando logout...");
    setIsSigningOut(true);

    try {
      // PASSO 1: Limpar estados IMEDIATAMENTE
      console.log("🧹 [AuthContext] Limpando estados locais...");
      setSession(null);
      setHasProfile(false);
      
      // PASSO 2: Chamar signOut do Supabase
      console.log("🔐 [AuthContext] Chamando supabase.auth.signOut()...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ [AuthContext] Erro no signOut:", error.message);
        throw error;
      }
      
      console.log("✅ [AuthContext] SignOut completo!");
      
      // PASSO 3: Pequeno delay para garantir propagação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error("❌ [AuthContext] Erro ao fazer signOut:", error);
      // Mesmo com erro, limpar estados
      setSession(null);
      setHasProfile(false);
      return false;
    } finally {
      setIsSigningOut(false);
      console.log("🏁 [AuthContext] signOut finalizado");
    }
  }, []);

  // Setup inicial
  useEffect(() => {
    console.log("🚀 [AuthContext] Iniciando setup...");

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
      console.log("🔍 [AuthContext] Verificando sessão inicial...");
      const { session: currentSession, hasProfile: profileExists } = 
        await verifySessionAndProfile();
      
      console.log("📊 [AuthContext] Sessão inicial:", {
        hasSession: !!currentSession,
        email: currentSession?.user?.email,
        hasProfile: profileExists
      });

      setSession(currentSession);
      setHasProfile(profileExists);
      setIsLoading(false);
      
      console.log("✅ [AuthContext] Setup inicial completo");
    };

    initAuth();

    // --- SUBSCREVER A MUDANÇAS DE AUTH ---
    const authSubscription = onAuthStateChange(async (event, newSession) => {
      console.log("🔐 [AuthContext] Auth event recebido:", event);
      console.log("📊 [AuthContext] Nova sessão:", {
        hasSession: !!newSession,
        email: newSession?.user?.email
      });

      // Se estamos a fazer signOut, não processar eventos
      // (os estados já foram limpos na função signOut)
      if (isSigningOut) {
        console.log("⏭️ [AuthContext] isSigningOut=true, ignorando evento");
        return;
      }

      setSession(newSession);

      // Verificar perfil quando há sessão
      if (newSession) {
        console.log("🔍 [AuthContext] Verificando perfil após mudança de auth...");
        const { hasProfile: profileExists } = await checkUserProfile(newSession.user.id);
        console.log("📊 [AuthContext] hasProfile:", profileExists);
        setHasProfile(profileExists);
      } else {
        console.log("🧹 [AuthContext] Sem sessão, limpando hasProfile");
        setHasProfile(false);
      }

      setIsLoading(false);
    });

    // --- CLEANUP ---
    return () => {
      console.log("🧹 [AuthContext] Cleanup...");
      authSubscription.unsubscribe();

      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isSigningOut]);

  // Log de mudanças de estado para debug
  useEffect(() => {
    console.log("📊 [AuthContext] Estado atualizado:", {
      hasSession: !!session,
      email: session?.user?.email,
      hasProfile,
      isLoading,
      isSigningOut,
    });
  }, [session, hasProfile, isLoading, isSigningOut]);

  // Valores disponíveis no contexto
  const value = {
    session,
    hasProfile,
    isLoading,
    isSigningOut,
    user: session?.user || null,
    refreshProfile,
    signOut, // ✅ NOVO!
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};