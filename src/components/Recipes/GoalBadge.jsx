/**
 * 🎯 GOAL BADGE
 * Badge que mostra o objetivo do usuário
 */

import { StyleSheet, Text, View } from 'react-native';

export const GoalBadge = ({ goal }) => {
  const getGoalColor = () => {
    switch (goal) {
      case 'Perder':
        return { bg: '#E74C3C22', text: '#E74C3C' };
      case 'Ganhar':
        return { bg: '#32CD3222', text: '#32CD32' };
      case 'Manter':
        return { bg: '#3498DB22', text: '#3498DB' };
      default:
        return { bg: '#666622', text: '#666' };
    }
  };

  const colors = getGoalColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.text }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        FOCO: {goal.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});