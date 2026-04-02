/**
 * 🏆 ACHIEVEMENT BANNER
 * Mostra streak atual + conquistas desbloqueadas
 */

import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ACHIEVEMENT_DEFINITIONS,
  getEnrichedAchievements,
} from "../../services/achievementService";
import {
  STREAK_EMOJIS,
  STREAK_MILESTONES,
} from "../../utils/dashboardConstants";
import { COLORS } from "../../utils/theme";

// Próximo milestone do streak
const getNextMilestone = (streak) => {
  return STREAK_MILESTONES.find((m) => m > streak) ?? null;
};

// Emoji atual do streak
const getStreakEmoji = (streak) => {
  const reached = [...STREAK_MILESTONES].reverse().find((m) => streak >= m);
  return reached ? STREAK_EMOJIS[reached] : "🔥";
};

export const AchievementBanner = ({
  metaAtingida,
  streak = 0,
  achievements = [],
}) => {
  const temConteudo = metaAtingida || streak > 0 || achievements.length > 0;
  if (!temConteudo) return null;

  const proximoMilestone = getNextMilestone(streak);
  const streakEmoji = getStreakEmoji(streak);
  const enriched = getEnrichedAchievements(achievements);

  return (
    <View style={styles.container}>
      {/* ── Meta de peso atingida ─────────────────────────────────────── */}
      {metaAtingida && (
        <View style={[styles.row, styles.goalRow]}>
          <Text style={styles.goalEmoji}>🎯</Text>
          <View style={styles.textCol}>
            <Text style={styles.goalTitle}>Meta Atingida!</Text>
            <Text style={styles.goalSub}>Modo manutenção ativo</Text>
          </View>
        </View>
      )}

      {/* ── Streak ───────────────────────────────────────────────────── */}
      {streak > 0 && (
        <View style={[styles.row, styles.streakRow]}>
          <Text style={styles.streakEmoji}>{streakEmoji}</Text>
          <View style={styles.textCol}>
            <Text style={styles.streakTitle}>
              {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
            </Text>
            {proximoMilestone && (
              <Text style={styles.streakSub}>
                Faltam {proximoMilestone - streak} dias para o próximo marco
              </Text>
            )}
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>{streak}</Text>
          </View>
        </View>
      )}

      {/* ── Achievements ganhos ───────────────────────────────────────── */}
      {enriched.length > 0 && (
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsLabel}>CONQUISTAS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {/* Mostrar todos os achievements possíveis — ganhos a cores, por ganhar a cinzento */}
            {Object.values(ACHIEVEMENT_DEFINITIONS).map((def) => {
              const ganho = enriched.find((a) => a.id === def.id);
              return (
                <View
                  key={def.id}
                  style={[styles.badge, !ganho && styles.badgeLocked]}
                >
                  <Text
                    style={[styles.badgeIcon, !ganho && styles.badgeIconLocked]}
                  >
                    {def.icon}
                  </Text>
                  <Text
                    style={[
                      styles.badgeTitle,
                      !ganho && styles.badgeTitleLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {ganho ? def.title : "???"}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  // Meta atingida
  goalRow: {
    backgroundColor: "rgba(50, 205, 50, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(50, 205, 50, 0.25)",
  },
  goalEmoji: { fontSize: 24 },
  goalTitle: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 },
  goalSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  // Streak
  streakRow: {
    backgroundColor: "rgba(255, 107, 53, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 53, 0.25)",
  },
  streakEmoji: { fontSize: 26 },
  streakTitle: { color: "#FF6B35", fontWeight: "bold", fontSize: 14 },
  streakSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  streakBadge: {
    marginLeft: "auto",
    backgroundColor: "rgba(255, 107, 53, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakBadgeText: {
    color: "#FF6B35",
    fontWeight: "bold",
    fontSize: 16,
  },
  textCol: { flex: 1 },
  // Achievements
  achievementsSection: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceHigh,
  },
  achievementsLabel: {
    color: "#555",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  achievementsScroll: {
    gap: 10,
    paddingRight: 4,
  },
  badge: {
    width: 72,
    alignItems: "center",
    gap: 6,
  },
  badgeLocked: {
    opacity: 0.35,
  },
  badgeIcon: {
    fontSize: 30,
  },
  badgeIconLocked: {
    fontSize: 30,
  },
  badgeTitle: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 13,
  },
  badgeTitleLocked: {
    color: "#555",
  },
});
