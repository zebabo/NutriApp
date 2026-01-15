/**
 * 🍽️ MEAL INPUT
 * Input de refeições com botão de favoritos
 */

import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export const MealInput = ({
  alimentoNome,
  setAlimentoNome,
  alimentoKcal,
  setAlimentoKcal,
  onAddMeal,
  onAddFavorite,
  favorites,
  showFavorites,
  setShowFavorites,
  onSelectFavorite,
  onRemoveFavorite,
}) => {
  return (
    <View style={styles.container}>
      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 2 }]}
          placeholder="Nome do alimento..."
          placeholderTextColor="#666"
          value={alimentoNome}
          onChangeText={setAlimentoNome}
        />
        
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 10 }]}
          placeholder="Kcal"
          keyboardType="numeric"
          placeholderTextColor="#666"
          value={alimentoKcal}
          onChangeText={setAlimentoKcal}
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddMeal}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.favoritesBtn}
          onPress={() => setShowFavorites(true)}
        >
          <Ionicons name="heart-outline" size={16} color="#FF6B6B" />
          <Text style={styles.favoritesBtnText}>
            Favoritos ({favorites.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addFavoriteBtn}
          onPress={onAddFavorite}
        >
          <Ionicons name="bookmark-outline" size={16} color="#32CD32" />
          <Text style={styles.addFavoriteBtnText}>
            Adicionar aos Favoritos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Favorites Modal */}
      <Modal
        visible={showFavorites}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFavorites(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>❤️ Favoritos</Text>
              <TouchableOpacity
                onPress={() => setShowFavorites(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Favorites List */}
            <ScrollView style={styles.favoritesList}>
              {favorites.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Ainda não tens favoritos.
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Adiciona alimentos aos favoritos para acesso rápido!
                  </Text>
                </View>
              ) : (
                favorites.map((fav) => (
                  <View key={fav.id} style={styles.favoriteItem}>
                    <TouchableOpacity
                      style={styles.favoriteItemContent}
                      onPress={() => {
                        onSelectFavorite(fav);
                        setShowFavorites(false);
                      }}
                    >
                      <Text style={styles.favoriteName}>{fav.nome}</Text>
                      <Text style={styles.favoriteKcal}>{fav.kcal} kcal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onRemoveFavorite(fav.id)}
                      style={styles.removeFavoriteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF4500" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#121212',
    color: '#FFF',
    padding: 14,
    borderRadius: 10,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#32CD32',
    width: 50,
    height: 50,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  favoritesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  favoritesBtnText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  addFavoriteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(50, 205, 50, 0.1)',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  addFavoriteBtnText: {
    color: '#32CD32',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  favoritesList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  favoriteItemContent: {
    flex: 1,
  },
  favoriteName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  favoriteKcal: {
    color: '#32CD32',
    fontSize: 13,
    fontWeight: 'bold',
  },
  removeFavoriteBtn: {
    padding: 8,
  },
});