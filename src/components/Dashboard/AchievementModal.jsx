/**
 * 🏆 ACHIEVEMENT MODAL
 * Popup animado que aparece quando ganhas um achievement
 */

import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../utils/theme";

export const AchievementModal = ({ achievement, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievement) return;

    // Haptic forte ao aparecer
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animação de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [achievement]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!achievement) return null;

  return (
    <Modal
      transparent
      visible={!!achievement}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Ícone */}
          <View style={[styles.iconCircle, { borderColor: achievement.color }]}>
            <Text style={styles.icon}>{achievement.icon}</Text>
          </View>

          {/* Textos */}
          <Text style={styles.label}>ACHIEVEMENT DESBLOQUEADO</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          {/* Botão */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: achievement.color }]}
            onPress={handleClose}
          >
            <Text style={styles.btnText}>Fixe! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.surfaceHigh,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
  },
  icon: {
    fontSize: 44,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
