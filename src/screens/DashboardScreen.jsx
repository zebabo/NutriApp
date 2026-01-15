/**
 * 📊 DASHBOARD SCREEN - CORRIGIDO
 * 
 * FIX: Loading infinito resolvido
 * Adicionado useEffect para carregar no mount inicial
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AchievementBanner } from '../components/Dashboard/AchievementBanner';
import { AITipCard } from '../components/Dashboard/AITipCard';
import { CaloriesCard } from '../components/Dashboard/CaloriesCard';
import { MacrosCard } from '../components/Dashboard/MacrosCard';
import { MealInput } from '../components/Dashboard/MealInput';
import { MealList } from '../components/Dashboard/MealList';
import { WaterCard } from '../components/Dashboard/WaterCard';
import { WeightChart } from '../components/Dashboard/WeightChart';
import { WeightProgress } from '../components/Dashboard/WeightProgress';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardScreen({ navigation }) {
  const {
    perfil,
    caloriasAlvo,
    macros,
    metaAtingida,
    unidade,
    loading,
    refreshing,
    novoPeso,
    setNovoPeso,
    alimentoNome,
    setAlimentoNome,
    alimentoKcal,
    setAlimentoKcal,
    favorites,
    showFavorites,
    setShowFavorites,
    inicializar,
    onRefresh,
    adicionarAgua,
    resetAgua,
    adicionarAlimento,
    removerAlimento,
    adicionarFavorito,
    removerFavorito,
    adicionarDeFavoritos,
    registarPeso,
    exibirPeso,
    calcularConsumidasHoje,
    calcularFaltam,
    metaAgua,
  } = useDashboard();

  // ✅ FIX: Carregar dados no mount inicial
  useEffect(() => {
    inicializar();
  }, []); // Array vazio = só executa uma vez no mount

  // Opcional: Recarregar quando voltar ao screen
  useFocusEffect(
    useCallback(() => {
      // Não chamar inicializar() aqui para evitar duplicação
      // Só use se quiser refresh ao voltar ao screen
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32CD32" />
        <Text style={styles.loadingText}>A carregar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>O Teu Dashboard ⚡</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabTextActive}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabInactive}
          onPress={() => navigation.navigate('Recipes')}
        >
          <Text style={styles.tabTextInactive}>Receitas 📖</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#32CD32"
            colors={['#32CD32']}
          />
        }
      >
        <AchievementBanner
          metaAtingida={metaAtingida}
          streak={perfil?.streak || 0}
        />

        <AITipCard objetivo={perfil?.objetivo} />

        <WaterCard
          aguaHoje={perfil?.agua_hoje || 0}
          metaAgua={metaAgua}
          onAddWater={adicionarAgua}
          onReset={resetAgua}
        />

        <CaloriesCard
          meta={caloriasAlvo}
          consumidas={calcularConsumidasHoje()}
          faltam={calcularFaltam()}
        />

        <MacrosCard
          proteina={macros.proteina}
          hidratos={macros.hidratos}
          gordura={macros.gordura}
        />

        <MealInput
          alimentoNome={alimentoNome}
          setAlimentoNome={setAlimentoNome}
          alimentoKcal={alimentoKcal}
          setAlimentoKcal={setAlimentoKcal}
          onAddMeal={adicionarAlimento}
          onAddFavorite={adicionarFavorito}
          favorites={favorites}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          onSelectFavorite={adicionarDeFavoritos}
          onRemoveFavorite={removerFavorito}
        />

        <MealList
          refeicoes={perfil?.refeicoes_hoje}
          onRemove={removerAlimento}
        />

        <WeightChart
          historico={perfil?.historico}
          unidade={unidade}
        />

        <WeightProgress
          pesoAtual={perfil?.pesoAtual}
          pesoAlvo={perfil?.pesoAlvo}
          metaAtingida={metaAtingida}
          unidade={unidade}
          novoPeso={novoPeso}
          setNovoPeso={setNovoPeso}
          onRegister={registarPeso}
        />

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Histórico Completo</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('History', { historico: perfil?.historico })}
            style={styles.historyBtn}
          >
            <Text style={styles.historyBtnText}>Ver Tudo</Text>
            <Ionicons name="arrow-forward" size={16} color="#32CD32" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsBtn: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 5,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabActive: {
    flex: 1,
    backgroundColor: '#32CD32',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabInactive: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: '#666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  historySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyBtnText: {
    color: '#32CD32',
    fontSize: 14,
    fontWeight: '600',
  },
});