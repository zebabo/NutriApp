/**
 * 👤 PROFILE SCREEN
 * Edição completa do perfil — todos os campos
 */

import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useProfileEdit } from "../hooks/useProfileEdit";

// ─── Componentes internos ─────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const FieldRow = ({ label, children, error }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldRight}>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  </View>
);

const Divider = () => <View style={styles.divider} />;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }) {
  const {
    nome,
    setNome,
    idade,
    setIdade,
    sexo,
    setSexo,
    altura,
    setAltura,
    pesoAtual,
    setPesoAtual,
    pesoAlvo,
    setPesoAlvo,
    objetivo,
    setObjetivo,
    atividade,
    setAtividade,
    unidade,
    setUnidade,
    loading,
    saving,
    hasChanges,
    ACTIVITY_LEVELS,
    GENDER_OPTIONS,
    OBJETIVOS,
    guardar,
    handleLogout,
  } = useProfileEdit();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  const weightUnit = unidade === "Imperial" ? "lb" : "kg";
  const heightUnit = unidade === "Imperial" ? "in" : "cm";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>O Teu Perfil 👤</Text>
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={guardar}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Unidades ───────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.fieldLabel}>Sistema de Unidades</Text>
            <Text style={styles.fieldSub}>
              {unidade === "Metric"
                ? "Métrico (kg / cm)"
                : "Imperial (lb / in)"}
            </Text>
          </View>
          <Switch
            value={unidade === "Imperial"}
            onValueChange={(v) => setUnidade(v ? "Imperial" : "Metric")}
            trackColor={{ false: "#333", true: "#32CD32" }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* ── Dados Pessoais ─────────────────────────────────────────────── */}
      <SectionTitle>DADOS PESSOAIS</SectionTitle>
      <View style={styles.card}>
        <FieldRow label="Nome">
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="O teu nome"
            placeholderTextColor="#555"
          />
        </FieldRow>

        <Divider />

        <FieldRow label="Idade">
          <View style={styles.inputWithSuffix}>
            <TextInput
              style={[styles.input, styles.inputShort]}
              value={idade}
              onChangeText={setIdade}
              placeholder="25"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.suffix}>anos</Text>
          </View>
        </FieldRow>

        <Divider />

        {/* Sexo */}
        <FieldRow label="Sexo">
          <View style={styles.toggleRow}>
            {GENDER_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.toggleBtn,
                  sexo === g.value && styles.toggleBtnActive,
                ]}
                onPress={() => setSexo(g.value)}
              >
                <Ionicons
                  name={g.icon}
                  size={16}
                  color={sexo === g.value ? "#000" : "#666"}
                />
                <Text
                  style={[
                    styles.toggleText,
                    sexo === g.value && styles.toggleTextActive,
                  ]}
                >
                  {g.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FieldRow>
      </View>

      {/* ── Medidas ────────────────────────────────────────────────────── */}
      <SectionTitle>MEDIDAS</SectionTitle>
      <View style={styles.card}>
        <FieldRow label={`Altura (${heightUnit})`}>
          <View style={styles.inputWithSuffix}>
            <TextInput
              style={[styles.input, styles.inputShort]}
              value={altura}
              onChangeText={setAltura}
              placeholder="170"
              placeholderTextColor="#555"
              keyboardType="decimal-pad"
            />
            <Text style={styles.suffix}>{heightUnit}</Text>
          </View>
        </FieldRow>

        <Divider />

        <FieldRow label={`Peso Atual (${weightUnit})`}>
          <View style={styles.inputWithSuffix}>
            <TextInput
              style={[styles.input, styles.inputShort]}
              value={pesoAtual}
              onChangeText={setPesoAtual}
              placeholder="70"
              placeholderTextColor="#555"
              keyboardType="decimal-pad"
            />
            <Text style={styles.suffix}>{weightUnit}</Text>
          </View>
        </FieldRow>

        <Divider />

        <FieldRow label={`Peso Alvo (${weightUnit})`}>
          <View style={styles.inputWithSuffix}>
            <TextInput
              style={[styles.input, styles.inputShort]}
              value={pesoAlvo}
              onChangeText={setPesoAlvo}
              placeholder="65"
              placeholderTextColor="#555"
              keyboardType="decimal-pad"
            />
            <Text style={styles.suffix}>{weightUnit}</Text>
          </View>
        </FieldRow>
      </View>

      {/* ── Objetivo ───────────────────────────────────────────────────── */}
      <SectionTitle>OBJETIVO</SectionTitle>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          {OBJETIVOS.map((obj) => (
            <TouchableOpacity
              key={obj}
              style={[
                styles.objetivoBtn,
                objetivo === obj && styles.objetivoBtnActive,
              ]}
              onPress={() => setObjetivo(obj)}
            >
              <Text
                style={[
                  styles.objetivoText,
                  objetivo === obj && styles.objetivoTextActive,
                ]}
              >
                {obj === "Perder"
                  ? "📉 Perder"
                  : obj === "Ganhar"
                    ? "📈 Ganhar"
                    : "⚖️ Manter"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Nível de Atividade ─────────────────────────────────────────── */}
      <SectionTitle>NÍVEL DE ATIVIDADE</SectionTitle>
      <View style={styles.card}>
        {ACTIVITY_LEVELS.map((level, index) => (
          <View key={level.value}>
            <TouchableOpacity
              style={styles.activityRow}
              onPress={() => setAtividade(level.value)}
            >
              <View style={styles.activityLeft}>
                <Ionicons
                  name={level.icon}
                  size={20}
                  color={atividade === level.value ? "#32CD32" : "#555"}
                />
                <View style={styles.activityText}>
                  <Text
                    style={[
                      styles.activityTitle,
                      atividade === level.value && styles.activityTitleActive,
                    ]}
                  >
                    {level.title}
                  </Text>
                  <Text style={styles.activityDesc}>{level.description}</Text>
                </View>
              </View>
              {atividade === level.value && (
                <Ionicons name="checkmark-circle" size={22} color="#32CD32" />
              )}
            </TouchableOpacity>
            {index < ACTIVITY_LEVELS.length - 1 && <Divider />}
          </View>
        ))}
      </View>

      {/* ── Histórico ──────────────────────────────────────────────────── */}
      <SectionTitle>HISTÓRICO</SectionTitle>
      <TouchableOpacity
        style={styles.linkCard}
        onPress={() => navigation.navigate("History", { historico: [] })}
      >
        <View style={styles.linkLeft}>
          <Ionicons name="bar-chart-outline" size={20} color="#32CD32" />
          <Text style={styles.linkText}>Ver Histórico de Peso</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </TouchableOpacity>

      {/* ── Logout ─────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF4500" />
        <Text style={styles.logoutText}>Terminar Sessão</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  saveBtn: {
    backgroundColor: "#32CD32",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    minWidth: 90,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Sections
  sectionTitle: {
    color: "#555",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 20,
  },
  // Cards
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
  },
  // Fields
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    minHeight: 52,
  },
  fieldLabel: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  fieldSub: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  fieldRight: {
    alignItems: "flex-end",
  },
  fieldError: {
    color: "#FF6B6B",
    fontSize: 11,
    marginTop: 2,
  },
  // Inputs
  input: {
    color: "#FFF",
    fontSize: 15,
    textAlign: "right",
    minWidth: 120,
    paddingVertical: 0,
  },
  inputShort: {
    minWidth: 60,
    textAlign: "right",
  },
  inputWithSuffix: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  suffix: {
    color: "#666",
    fontSize: 13,
  },
  // Toggle (Sexo)
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 14,
    flexWrap: "wrap",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: "#32CD32",
  },
  toggleText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#000",
  },
  // Objetivo
  objetivoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
  },
  objetivoBtnActive: {
    backgroundColor: "#32CD32",
  },
  objetivoText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  objetivoTextActive: {
    color: "#000",
  },
  // Atividade
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  activityTitleActive: {
    color: "#FFF",
  },
  activityDesc: {
    color: "#555",
    fontSize: 12,
    marginTop: 2,
  },
  // Link card
  linkCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 69, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 69, 0, 0.25)",
    gap: 10,
  },
  logoutText: {
    color: "#FF4500",
    fontWeight: "bold",
    fontSize: 16,
  },
});
