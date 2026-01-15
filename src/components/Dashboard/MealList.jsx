/**
 * 📝 MEAL LIST
 * Lista de refeições com opção de remover
 */

import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MealList = ({ refeicoes, onRemove }) => {
  if (!refeicoes || refeicoes.length === 0) {
    return null;
  }

  const totalKcal = refeicoes.reduce((sum, item) => sum + item.kcal, 0);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nome}</Text>
          <View style={styles.itemMeta}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.itemTime}>{item.hora}</Text>
          </View>
        </View>
        
        <View style={styles.itemRight}>
          <Text style={styles.itemKcal}>{item.kcal} kcal</Text>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#FF4500" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hoje 🍽️</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalText}>{totalKcal} kcal</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={refeicoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalBadge: {
    backgroundColor: '#32CD32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  item: {
    paddingVertical: 12,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemTime: {
    color: '#666',
    fontSize: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemKcal: {
    color: '#32CD32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },
});