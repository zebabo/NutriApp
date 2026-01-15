import { Alert } from 'react-native';
import { supabase } from './supabase';

/**
 * FUNÇÃO DE DESENVOLVIMENTO - Apaga TUDO (Perfil + Conta Auth)
 * Útil para testar o fluxo completo de registo de novo utilizador
 * 
 * @param {Function} refreshProfile - Função do useAuth para atualizar estado
 * @returns {Promise<{success: boolean, error: object|null}>}
 */
export const deleteAccountCompletely = async () => {
  try {
    console.log("🔵 INÍCIO - APAGAR CONTA COMPLETA");
    
    // Obter utilizador atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Erro ao obter utilizador:", userError);
      return { success: false, error: userError };
    }

    console.log("✅ Utilizador obtido:", user.id);
    
    // 1. Apagar perfil primeiro
    console.log("🗑️ Passo 1: A apagar perfil...");
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteProfileError) {
      console.warn("⚠️ Erro ao apagar perfil:", deleteProfileError.message);
    } else {
      console.log("✅ Perfil apagado!");
    }

    // 2. Apagar conta de autenticação
    console.log("🗑️ Passo 2: A apagar conta de autenticação...");
    
    // Nota: Esta função pode não funcionar sem permissões admin
    // Mas vamos tentar na mesma
    const { error: deleteUserError } = await supabase.rpc('delete_user');

    if (deleteUserError) {
      console.warn("⚠️ Não foi possível apagar conta automaticamente:", deleteUserError.message);
      console.log("💡 Vais precisar de apagar manualmente no Supabase ou criar nova conta");
      
      // Fazer logout já que não conseguimos apagar
      await supabase.auth.signOut();
      
      return { 
        success: false, 
        error: {
          message: "MANUAL_DELETE_REQUIRED",
          details: "Perfil apagado mas conta de auth precisa ser apagada manualmente"
        }
      };
    }

    console.log("✅ Conta de autenticação apagada!");
    console.log("🔵 FIM - Conta completamente removida!");
    
    // Logout automático (redundante mas garante)
    await supabase.auth.signOut();

    return { success: true, error: null };

  } catch (error) {
    console.error("❌ Exceção ao apagar conta:", error);
    return { success: false, error };
  }
};

/**
 * Mostra confirmação e apaga conta completa
 * Uso: Botão extra no SettingsScreen para desenvolvimento
 */
export const confirmAndDeleteAccount = async () => {
  Alert.alert(
    "⚠️ APAGAR CONTA COMPLETA",
    "Isto vai apagar:\n• Perfil\n• Conta de autenticação\n• TUDO!\n\nVais ter de REGISTAR novamente. Confirmas?",
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "SIM, APAGAR TUDO",
        style: "destructive",
        onPress: async () => {
          const { success, error } = await deleteAccountCompletely();
          
          if (success) {
            Alert.alert(
              "✅ Conta Apagada!", 
              "A conta foi completamente removida. Podes registar novamente!"
            );
          } else {
            if (error?.message === "MANUAL_DELETE_REQUIRED") {
              Alert.alert(
                "⚠️ Ação Manual Necessária",
                "Perfil foi apagado mas precisas de:\n\n1. Ir ao Dashboard Supabase\n2. Authentication → Users\n3. Apagar o teu utilizador\n\nOu criar nova conta com outro email!",
                [
                  { 
                    text: "OK, Vou Criar Nova Conta",
                    onPress: () => {
                      // Já fizemos logout, vai para AuthScreen
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                "❌ Erro", 
                `Não foi possível apagar: ${error?.message || 'Erro desconhecido'}`
              );
            }
          }
        }
      }
    ]
  );
};

/**
 * FUNÇÃO DE DESENVOLVIMENTO - Remove o perfil do utilizador
 * Útil para testar o fluxo de criação de perfil
 * 
 * @param {Function} refreshProfile - Função do useAuth para atualizar estado
 * @returns {Promise<{success: boolean, error: object|null}>}
 */
export const resetUserProfile = async (refreshProfile) => {
  try {
    console.log("🔵 INÍCIO DO RESET PROFILE");
    
    // Obter utilizador atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("❌ Erro ao obter utilizador:", userError);
      return { success: false, error: userError };
    }

    console.log("✅ Utilizador obtido:", user.id);
    
    // Verificar se perfil existe ANTES de tentar apagar
    const { data: profileCheck } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log("📊 Perfil atual na BD:", profileCheck);
    
    if (!profileCheck) {
      console.log("⚠️ Perfil já não existe! Nada a apagar.");
      // Mesmo assim, refresh para garantir
      if (refreshProfile) await refreshProfile();
      return { success: true, error: null };
    }

    console.log("🗑️ A resetar perfil do utilizador:", user.id);

    // OPÇÃO 1: Tentar apagar (pode falhar por RLS)
    console.log("🔄 Tentando DELETE...");
    const { error: deleteError, data: deleteData } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)
      .select(); // Adicionar select para ver o que foi apagado

    console.log("📊 Resultado do DELETE:", { error: deleteError, data: deleteData });

    // Se falhou por RLS, fazer "soft delete" (limpar dados)
    if (deleteError) {
      console.log("⚠️ DELETE falhou:", deleteError.message);
      console.log("🔄 Tentando soft delete (limpar campos)...");
      
      const { error: updateError, data: updateData } = await supabase
        .from('profiles')
        .update({
          peso_atual: null,
          peso_alvo: null,
          altura: null,
          idade: null,
          sexo: null,
          objetivo: null,
          fator_atividade: null,
          ultima_data: null
        })
        .eq('id', user.id)
        .select();

      console.log("📊 Resultado do UPDATE:", { error: updateError, data: updateData });

      if (updateError) {
        console.error("❌ Erro ao limpar perfil:", updateError);
        return { success: false, error: updateError };
      }
      
      console.log("✅ Perfil limpo com sucesso (soft delete)!");
    } else {
      console.log("✅ Perfil apagado com sucesso (hard delete)!");
      console.log("📊 Dados apagados:", deleteData);
    }

    // Atualizar estado no AuthContext
    console.log("🔄 A chamar refreshProfile...");
    if (refreshProfile) {
      await refreshProfile();
      console.log("✅ refreshProfile executado!");
    } else {
      console.warn("⚠️ refreshProfile não foi fornecido!");
    }

    console.log("🔵 FIM DO RESET PROFILE");
    return { success: true, error: null };

  } catch (error) {
    console.error("❌ Exceção ao resetar perfil:", error);
    return { success: false, error };
  }
};

/**
 * Mostra confirmação e reseta o perfil
 * Uso: Adiciona ao botão no SettingsScreen
 * 
 * @param {Function} refreshProfile - Função do useAuth
 */
export const confirmAndResetProfile = (refreshProfile) => {
  Alert.alert(
    "⚠️ Resetar Perfil",
    "Isto vai APAGAR o teu perfil para testares novamente. Tens a certeza?",
    [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "SIM, APAGAR",
        style: "destructive",
        onPress: async () => {
          const { success, error } = await resetUserProfile(refreshProfile);
          
          if (success) {
            Alert.alert(
              "✅ Perfil Resetado!", 
              "Vais ser redirecionado para criar o perfil novamente."
            );
            // O AuthContext vai automaticamente redirecionar para FormScreen
          } else {
            Alert.alert(
              "❌ Erro", 
              `Não foi possível apagar o perfil: ${error?.message || 'Erro desconhecido'}`
            );
          }
        }
      }
    ]
  );
};