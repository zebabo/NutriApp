/**
 * 📑 CATEGORY TABS
 * Tabs horizontais para categorias
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORIES } from '../../utils/recipeConstants';

export const CategoryTabs = ({ activeCategory, onCategoryChange, favoritesCount = 0 }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.label;
          const isFavorites = cat.id === 'favorites';
          const count = isFavorites ? favoritesCount : null;

          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onCategoryChange(cat.label)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat.icon} {cat.label}
                {count !== null && count > 0 && (
                  <Text style={styles.count}> ({count})</Text>
                )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    height: 40,
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#32CD32',
  },
  tabText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#000',
  },
  count: {
    fontSize: 12,
  },
});