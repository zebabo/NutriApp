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
import { COLORS } from "../utils/theme";

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
        <ActivityIndicator size="large" color={COLORS.primary} />
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
    if (pesquisa.length > 0)
      return (
        <EmptyState
          icon="search-outline"
          title="Nenhum resultado"
          message={`Não encontrámos receitas para "${pesquisa}"`}
        />
      );
    if (categoriaAtiva === "Favoritos")
      return (
        <EmptyState
          icon="heart-outline"
          title="Sem favoritos"
          message="Toca no ❤️ nas receitas para adicionar!"
        />
      );
    return (
      <EmptyState title="Nenhuma receita" message="Tenta outra categoria." />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cozinha Lusa 🇵🇹</Text>
        <GoalBadge goal={objetivo} />
      </View>
      <SearchBar
        value={pesquisa}
        onChangeText={setPesquisa}
        onClear={handleClearSearch}
      />
      {pesquisa.length === 0 && (
        <CategoryTabs
          activeCategory={categoriaAtiva}
          onCategoryChange={setCategoriaAtiva}
          favoritesCount={getFavoritesCount()}
        />
      )}
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
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.textInverse,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.textInverse,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: COLORS.textPrimary, marginTop: 12, fontSize: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: "bold" },
  listContent: { paddingBottom: 30 },
});
