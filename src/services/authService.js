import { supabase } from './supabase';

/**
 * Serviço de Autenticação
 * Centraliza toda a lógica de autenticação com o Supabase
 */

/**
 * Obtém a sessão atual do utilizador
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Erro ao obter sessão:", error);
      return { session: null, error };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error("❌ Exceção ao obter sessão:", error);
    return { session: null, error };
  }
};

/**
 * Verifica se o utilizador tem um perfil criado
 * @param {string} userId - ID do utilizador
 * @returns {Promise<{hasProfile: boolean, error: object|null}>}
 */
export const checkUserProfile = async (userId) => {
  try {
    console.log("🔍 Verificando perfil para userId:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    console.log("📊 Resultado da query:", { data, error });
    
    if (error) {
      // Se o erro for "PGRST116" significa que não encontrou o perfil (não existe)
      if (error.code === 'PGRST116') {
        console.log("ℹ️ Perfil não existe");
        return { hasProfile: false, error: null };
      }
      
      console.error("❌ Erro ao buscar perfil:", error);
      return { hasProfile: false, error };
    }
    
    const hasProfile = !!data;
    console.log("✅ Tem perfil?", hasProfile);
    
    return { hasProfile, error: null };
    
  } catch (error) {
    console.error("❌ Exceção ao verificar perfil:", error);
    return { hasProfile: false, error };
  }
};

/**
 * Verifica sessão e perfil do utilizador
 * @returns {Promise<{session: object|null, hasProfile: boolean, error: object|null}>}
 */
export const verifySessionAndProfile = async () => {
  const { session, error: sessionError } = await getCurrentSession();
  
  if (sessionError || !session) {
    return { session: null, hasProfile: false, error: sessionError };
  }
  
  const { hasProfile, error: profileError } = await checkUserProfile(session.user.id);
  
  return { 
    session, 
    hasProfile, 
    error: profileError 
  };
};

/**
 * Faz login com email e password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("❌ Erro no login:", error);
      return { session: null, error };
    }
    
    console.log("✅ Login bem-sucedido");
    return { session: data.session, error: null };
    
  } catch (error) {
    console.error("❌ Exceção no login:", error);
    return { session: null, error };
  }
};

/**
 * Faz registo de novo utilizador
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{session: object|null, user: object|null, error: object|null}>}
 */
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error("❌ Erro no registo:", error);
      return { session: null, user: null, error };
    }
    
    console.log("✅ Registo bem-sucedido");
    return { session: data.session, user: data.user, error: null };
    
  } catch (error) {
    console.error("❌ Exceção no registo:", error);
    return { session: null, user: null, error };
  }
};

/**
 * Faz logout do utilizador
 * @returns {Promise<{error: object|null}>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("❌ Erro no logout:", error);
      return { error };
    }
    
    console.log("✅ Logout bem-sucedido");
    return { error: null };
    
  } catch (error) {
    console.error("❌ Exceção no logout:", error);
    return { error };
  }
};

/**
 * Envia email para reset de password
 * @param {string} email 
 * @returns {Promise<{error: object|null}>}
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'smartnutritionapp://reset-password',
    });
    
    if (error) {
      console.error("❌ Erro ao enviar email de reset:", error);
      return { error };
    }
    
    console.log("✅ Email de reset enviado");
    return { error: null };
    
  } catch (error) {
    console.error("❌ Exceção ao enviar email de reset:", error);
    return { error };
  }
};

/**
 * Subscreve às mudanças de estado de autenticação
 * @param {Function} callback - Função callback (event, session) => {}
 * @returns {object} subscription - Objeto com método unsubscribe()
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};