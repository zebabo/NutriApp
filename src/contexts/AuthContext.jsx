import * as Notifications from "expo-notifications";
import { createContext, useEffect, useRef, useState } from "react";
import {
  checkUserProfile,
  onAuthStateChange,
  verifySessionAndProfile,
} from "../services/authService";
import {
  registerForPushNotificationsAsync,
  scheduleWaterReminder,
} from "../services/notificationService";

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

    console.log(
      "🔍 [AuthContext] A verificar perfil para userId:",
      session.user.id,
    );
    const { hasProfile: profileExists } = await checkUserProfile(
      session.user.id,
    );
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
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notificação recebida:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Interação com notificação detectada");
      });

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
      console.log("🔐 ========== AUTH EVENT ==========");
      console.log("Event:", event);
      console.log("Session:", newSession ? "EXISTS" : "NULL");
      console.log("User ID:", newSession?.user?.id);
      console.log("================================");

      // ✅ IGNORAR eventos de PASSWORD_RECOVERY e USER_UPDATED
      // Estes eventos são disparados durante o reset de password
      // e podem criar sessões temporárias que interferem com o fluxo
      if (event === "PASSWORD_RECOVERY" || event === "USER_UPDATED") {
        console.log(
          `⚠️ [AuthContext] Ignorando evento ${event} (reset password em progresso)`,
        );
        return;
      }

      // ✅ Só processar SIGNED_IN e SIGNED_OUT
      if (event === "SIGNED_OUT") {
        console.log("🚪 [AuthContext] SIGNED_OUT - limpando estado");
        setSession(null);
        setHasProfile(false);
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN") {
        console.log(
          "🔑 [AuthContext] SIGNED_IN - verificando perfil primeiro...",
        );

        // ✅ IMPORTANTE: Verificar perfil ANTES de atualizar o estado
        let profileExists = false;
        if (newSession?.user?.id) {
          console.log("🔍 [AuthContext] A verificar perfil...");
          const result = await checkUserProfile(newSession.user.id);
          profileExists = result.hasProfile;
          console.log("📊 [AuthContext] Perfil existe:", profileExists);
        }

        // ✅ Agora atualiza AMBOS os estados de uma vez
        console.log(
          "✅ [AuthContext] Atualizando estados: session=true, hasProfile=" +
            profileExists,
        );
        setHasProfile(profileExists);
        setSession(newSession);
        setIsLoading(false);
        return;
      }

      // Para outros eventos (INITIAL_SESSION, TOKEN_REFRESHED, etc.)
      console.log(`ℹ️ [AuthContext] Evento ${event} - atualizando sessão`);
      setSession(newSession);

      if (newSession?.user?.id) {
        const { hasProfile: profileExists } = await checkUserProfile(
          newSession.user.id,
        );
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
