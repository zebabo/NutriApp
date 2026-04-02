/**
 * 📊 DASHBOARD SCREEN
 *
 * Header: "O Teu Dashboard ⚡" + ícone settings
 * Tab switcher: Dashboard (ativo) | Receitas 📖
 * Conteúdo: igual ao original
 */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AchievementBanner } from "../components/Dashboard/AchievementBanner";
import { AchievementModal } from "../components/Dashboard/AchievementModal";
import { AITipCard } from "../components/Dashboard/AITipCard";
import { CaloriesCard } from "../components/Dashboard/CaloriesCard";
import { MacrosCard } from "../components/Dashboard/MacrosCard";
import { MealInput } from "../components/Dashboard/MealInput";
import { MealList } from "../components/Dashboard/MealList";
import { WaterCard } from "../components/Dashboard/WaterCard";
import { WeightChart } from "../components/Dashboard/WeightChart";
import { WeightProgress } from "../components/Dashboard/WeightProgress";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardScreen({ navigation }) {
  const {
    perfil,
    dailyLog,
    streak,
    achievements,
    newAchievement,
    setNewAchievement,
    caloriasAlvo,
    macrosAlvo,
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

  useFocusEffect(useCallback(() => {}, []));

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
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>O Teu Dashboard ⚡</Text>
      </View>

      {/* ── Achievement Modal (popup ao ganhar) ──────────────────────── */}
      <AchievementModal
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />

      {/* ── Conteúdo ─────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#32CD32"
            colors={["#32CD32"]}
          />
        }
      >
        <AchievementBanner
          metaAtingida={metaAtingida}
          streak={streak}
          achievements={achievements}
        />

        <AITipCard objetivo={perfil?.objetivo} />

        <WaterCard
          aguaHoje={dailyLog?.water_ml || 0}
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
          proteina={macrosAlvo.proteina}
          hidratos={macrosAlvo.hidratos}
          gordura={macrosAlvo.gordura}
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
          refeicoes={dailyLog?.meals || []}
          onRemove={removerAlimento}
        />

        <WeightChart historico={perfil?.historico} unidade={unidade} />

        <WeightProgress
          pesoAtual={perfil?.pesoAtual}
          pesoAlvo={perfil?.pesoAlvo}
          metaAtingida={metaAtingida}
          unidade={unidade}
          novoPeso={novoPeso}
          setNovoPeso={setNovoPeso}
          onRegister={registarPeso}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    marginTop: 10,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  historySection: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#32CD32",
  },
  historyBtnText: {
    color: "#32CD32",
    fontWeight: "bold",
    marginRight: 5,
  },
});
