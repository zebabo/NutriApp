import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import {
  confirmAndDeleteAccount,
  confirmAndResetProfile,
} from "../services/devTools.service";
import { exportarRelatorio } from "../services/exportService";
import {
  cancelNotification,
  scheduleDailyQuote,
  scheduleWaterReminder,
} from "../services/notificationService";

export default function SettingsScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();

  const [waterReminders, setWaterReminders] = useState(true);
  const [dailyQuote, setDailyQuote] = useState(false);
  const [waterInterval, setWaterInterval] = useState(2);

  useEffect(() => {
    carregarPreferencias();
  }, []);

  const carregarPreferencias = async () => {
    try {
      const reminders = await AsyncStorage.getItem("@water_reminders");
      const quote = await AsyncStorage.getItem("@daily_quote");
      const interval = await AsyncStorage.getItem("@water_interval");

      if (reminders !== null) setWaterReminders(JSON.parse(reminders));
      if (quote !== null) setDailyQuote(JSON.parse(quote));
      if (interval !== null) setWaterInterval(JSON.parse(interval));
    } catch (e) {
      console.log("Erro ao carregar preferências:", e);
    }
  };

  const toggleWaterReminders = async (value) => {
    setWaterReminders(value);
    await AsyncStorage.setItem("@water_reminders", JSON.stringify(value));

    if (value) {
      await scheduleWaterReminder(waterInterval);
      Alert.alert("✅ Ativado", "Vais receber lembretes para beber água.");
    } else {
      await cancelNotification("water_reminder");
      Alert.alert("🔕 Desativado", "Lembretes de água cancelados.");
    }
  };

  const toggleDailyQuote = async (value) => {
    setDailyQuote(value);
    await AsyncStorage.setItem("@daily_quote", JSON.stringify(value));

    if (value) {
      await scheduleDailyQuote();
      Alert.alert("✅ Ativado", "Receberás motivação diária às 09:00.");
    } else {
      await cancelNotification("daily_quote");
      Alert.alert("🔕 Desativado", "Motivação diária desativada.");
    }
  };

  const changeWaterInterval = async () => {
    Alert.alert(
      "Intervalo de Lembretes",
      "De quantas em quantas horas queres ser lembrado?",
      [
        { text: "A cada 1 hora", onPress: () => updateInterval(1) },
        { text: "A cada 2 horas", onPress: () => updateInterval(2) },
        { text: "A cada 3 horas", onPress: () => updateInterval(3) },
        { text: "A cada 4 horas", onPress: () => updateInterval(4) },
        { text: "Cancelar", style: "cancel" },
      ],
    );
  };

  const updateInterval = async (val) => {
    setWaterInterval(val);
    await AsyncStorage.setItem("@water_interval", JSON.stringify(val));

    if (waterReminders) {
      await scheduleWaterReminder(val);
      Alert.alert("✅ Atualizado", `Lembretes a cada ${val}h`);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      "📊 Exportar Dados",
      "Gerar relatório PDF com o teu histórico de peso e refeições?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Gerar PDF",
          onPress: () => exportarRelatorio(user?.id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Definições ⚙️</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CONTA */}
        <Text style={styles.sectionTitle}>👤 Conta</Text>
        <View style={styles.settingItem}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#32CD32"
            style={{ marginRight: 15 }}
          />
          <Text style={styles.settingLabel}>
            {user?.email || "A carregar..."}
          </Text>
        </View>

        {/* LEMBRETES */}
        <Text style={styles.sectionTitle}>🔔 Lembretes</Text>

        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Lembrete de Água</Text>
            <Text style={styles.settingDesc}>Notificações automáticas</Text>
          </View>
          <Switch
            value={waterReminders}
            onValueChange={toggleWaterReminders}
            trackColor={{ false: "#333", true: "#1A331A" }}
            thumbColor={waterReminders ? "#32CD32" : "#f4f3f4"}
          />
        </View>

        {waterReminders && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={changeWaterInterval}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Frequência de Água</Text>
              <Text style={styles.settingDesc}>
                Atualmente: a cada {waterInterval}h
              </Text>
            </View>
            <Ionicons name="time-outline" size={20} color="#32CD32" />
          </TouchableOpacity>
        )}

        <View style={styles.settingItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Motivação Diária</Text>
            <Text style={styles.settingDesc}>Frase inspiradora às 09:00</Text>
          </View>
          <Switch
            value={dailyQuote}
            onValueChange={toggleDailyQuote}
            trackColor={{ false: "#333", true: "#1A331A" }}
            thumbColor={dailyQuote ? "#32CD32" : "#f4f3f4"}
          />
        </View>

        {/* DADOS */}
        <Text style={styles.sectionTitle}>📊 Dados</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Exportar Histórico</Text>
            <Text style={styles.settingDesc}>Gerar relatório em PDF</Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#32CD32" />
        </TouchableOpacity>

        {/* ===== FERRAMENTAS DE DESENVOLVIMENTO ===== */}
        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devTitle}>
              🔧 Ferramentas de Desenvolvimento
            </Text>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => confirmAndResetProfile(refreshProfile)}
            >
              <Ionicons name="refresh-outline" size={20} color="#FFA500" />
              <Text style={[styles.resetButtonText, { color: "#FFA500" }]}>
                RESETAR PERFIL (mantém conta)
              </Text>
            </TouchableOpacity>

            <Text style={styles.devWarning}>
              ⚠️ Apaga o perfil mas mantém a conta de auth
            </Text>

            <View style={{ height: 15 }} />

            <TouchableOpacity
              style={[
                styles.resetButton,
                { borderColor: "#FF6B6B", backgroundColor: "#3A2020" },
              ]}
              onPress={() => confirmAndDeleteAccount()}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              <Text style={styles.resetButtonText}>APAGAR CONTA COMPLETA</Text>
            </TouchableOpacity>

            <Text style={styles.devWarning}>
              🔥 Apaga TUDO - terás de registar novamente!
            </Text>
          </View>
        )}

        <Text style={styles.versionText}>Versão 1.0.0 (Beta)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    marginTop: 70,
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
  },
  content: {
    padding: 25,
    paddingBottom: 50,
  },
  sectionTitle: {
    color: "#32CD32",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  settingLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  settingDesc: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    color: "#444",
    marginTop: 30,
    fontSize: 12,
    marginBottom: 20,
  },
  devSection: {
    backgroundColor: "#2A1A1A",
    padding: 20,
    borderRadius: 15,
    marginTop: 30,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    borderStyle: "dashed",
  },
  devTitle: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#3A2020",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  resetButtonText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 10,
  },
  devWarning: {
    color: "#999",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});
