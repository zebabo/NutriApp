/**
 * 🏆 ACHIEVEMENT BANNER
 * Banner que aparece quando meta é atingida
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export const AchievementBanner = ({ metaAtingida, streak }) => {
  if (!metaAtingida && !streak) return null;

  return (
    <View style={styles.container}>
      {metaAtingida && (
        <View style={styles.achievement}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.text}>
            Meta Atingida! Modo Manutenção Ativo 🏆
          </Text>
        </View>
      )}

      {streak > 0 && (
        <View style={[styles.achievement, styles.streakAchievement]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.text}>
            {streak} {streak === 1 ? 'dia' : 'dias'} consecutivos!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  achievement: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 10,
  },
  streakAchievement: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
  streakEmoji: {
    fontSize: 20,
  },
  text: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
    flex: 1,
  },
});