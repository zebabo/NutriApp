import { StyleSheet, Text, View } from "react-native";
import { AI_TIPS } from "../../utils/dashboardConstants";
import { COLORS } from "../../utils/theme";

export const AITipCard = ({ objetivo = "Manter" }) => {
  const getDica = () => {
    const hora = new Date().getHours();
    const dicas = AI_TIPS[objetivo] || AI_TIPS.Manter;
    if (hora >= 5 && hora < 12)
      return { titulo: "Pequeno-almoço ☕", dica: dicas.manha };
    if (hora >= 12 && hora < 15)
      return { titulo: "Almoço 🍽️", dica: dicas.almoco };
    if (hora >= 15 && hora < 19)
      return { titulo: "Lanche da Tarde 🥤", dica: dicas.tarde };
    if (hora >= 19 && hora < 23)
      return { titulo: "Jantar 🌙", dica: dicas.noite };
    return { titulo: `Dica de Foco (${objetivo}) 🎯`, dica: dicas.foco };
  };
  const { titulo, dica } = getDica();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{titulo}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{objetivo}</Text>
        </View>
      </View>
      <Text style={styles.dica}>{dica}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { color: COLORS.textPrimary, fontWeight: "bold", fontSize: 16 },
  badge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  dica: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
});
