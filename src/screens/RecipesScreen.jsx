/**
 * 🍽️ RECIPES SCREEN
 *
 * Header: "Cozinha Lusa 🇵🇹" + GoalBadge
 * Tab switcher: Dashboard | Receitas 📖 (ativo)
 * Conteúdo: SearchBar + CategoryTabs + FlatList
 */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CategoryTabs } from "../components/Recipes/CategoryTabs";
import { EmptyState } from "../components/Recipes/EmptyState";
import { GoalBadge } from "../components/Recipes/GoalBadge";
import { RecipeCard } from "../components/Recipes/RecipeCard";
import { SearchBar } from "../components/Recipes/SearchBar";
import { useRecipes } from "../hooks/useRecipes";

export default function RecipesScreen({ navigation }) {
  const {
    objetivo,
    categoriaAtiva,
    pesquisa,
    receitasFiltradas,
    loading,
    refreshing,
    setCategoriaAtiva,
    setPesquisa,
    inicializar,
    onRefresh,
    toggleFavorito,
    handleClearSearch,
    isRecipeFavorite,
    getFavoritesCount,
  } = useRecipes();

  useEffect(() => {
    inicializar();
  }, []);
  useFocusEffect(useCallback(() => {}, []));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32CD32" />
        <Text style={styles.loadingText}>A carregar receitas...</Text>
      </View>
    );
  }

  const renderRecipe = ({ item }) => (
    <RecipeCard
      recipe={item}
      isFavorite={isRecipeFavorite(item.id)}
      isRecommended={item.type === objetivo}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
      onToggleFavorite={() => toggleFavorito(item.id)}
    />
  );

  const renderEmpty = () => {
    if (pesquisa.length > 0) {
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum resultado"
          message={`Não encontrámos receitas para "${pesquisa}"`}
        />
      );
    }
    if (categoriaAtiva === "Favoritos") {
      return (
        <EmptyState
          icon="heart-outline"
          title="Sem favoritos"
          message="Toca no ❤️ nas receitas para adicionar aos favoritos!"
        />
      );
    }
    return (
      <EmptyState title="Nenhuma receita" message="Tenta outra categoria." />
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cozinha Lusa 🇵🇹</Text>
        <GoalBadge goal={objetivo} />
      </View>

      {/* ── Search Bar ───────────────────────────────────────────────── */}
      <SearchBar
        value={pesquisa}
        onChangeText={setPesquisa}
        onClear={handleClearSearch}
      />

      {/* ── Category Tabs ────────────────────────────────────────────── */}
      {pesquisa.length === 0 && (
        <CategoryTabs
          activeCategory={categoriaAtiva}
          onCategoryChange={setCategoriaAtiva}
          favoritesCount={getFavoritesCount()}
        />
      )}

      {/* ── Lista de Receitas ─────────────────────────────────────────── */}
      <FlatList
        data={receitasFiltradas}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#32CD32"
            colors={["#32CD32"]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 30,
  },
});
