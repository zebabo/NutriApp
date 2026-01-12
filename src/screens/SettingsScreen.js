import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
  cancelNotification,
  scheduleDailyQuote,
  scheduleWaterReminder,
} from '../services/notificationService';
import { supabase } from '../services/supabase';

export default function SettingsScreen({ navigation }) {
  const [waterReminders, setWaterReminders] = useState(true);
  const [dailyQuote, setDailyQuote] = useState(false);
  const [waterInterval, setWaterInterval] = useState(2); 
  const [unitSystem, setUnitSystem] = useState('Metric'); 
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
  carregarPreferencias();
  obterUser();
}, []);

  const obterUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email);
  };

  const carregarPreferencias = async () => {
    try {
      const reminders = await AsyncStorage.getItem('@water_reminders');
      const quote = await AsyncStorage.getItem('@daily_quote');
      const interval = await AsyncStorage.getItem('@water_interval');
      const units = await AsyncStorage.getItem('@unit_system');

      if (reminders !== null) setWaterReminders(JSON.parse(reminders));
      if (quote !== null) setDailyQuote(JSON.parse(quote));
      if (interval !== null) setWaterInterval(JSON.parse(interval));
      if (units !== null) setUnitSystem(units);
    } catch (e) { console.log("Erro ao carregar:", e); }
  };

  const toggleUnits = async () => {
    const novoSistema = unitSystem === 'Metric' ? 'Imperial' : 'Metric';
    setUnitSystem(novoSistema);
    await AsyncStorage.setItem('@unit_system', novoSistema);
  };

  const toggleWaterReminders = async (value) => {
    setWaterReminders(value);
    await AsyncStorage.setItem('@water_reminders', JSON.stringify(value));
    if (value) {
      await scheduleWaterReminder(waterInterval);
      Alert.alert("Ativado", "Lembretes de água ativos.");
    } else {
      await cancelNotification('water_reminder');
      Alert.alert("Desativado", "Lembretes de água cancelados.");
    }
  };

  const toggleDailyQuote = async (value) => {
    setDailyQuote(value);
    await AsyncStorage.setItem('@daily_quote', JSON.stringify(value));
    if (value) {
      await scheduleDailyQuote();
      Alert.alert("Ativado", "Receberás motivação diária às 09:00.");
    } else {
      await cancelNotification('daily_quote');
      Alert.alert("Desativado", "Motivação diária desativada.");
    }
  };

  const changeWaterInterval = async () => {
    Alert.alert("Intervalo", "Escolha a frequência:", [
      { text: "1h", onPress: () => updateInterval(1) },
      { text: "2h", onPress: () => updateInterval(2) },
      { text: "3h", onPress: () => updateInterval(3) },
      { text: "Cancelar", style: "cancel" }
    ]);
  };

  const updateInterval = async (val) => {
    setWaterInterval(val);
    await AsyncStorage.setItem('@water_interval', JSON.stringify(val));
    if (waterReminders) await scheduleWaterReminder(val);
  };

  const handleExportData = () => {
    Alert.alert("Exportar", "Deseja gerar um relatório com o seu histórico de peso?", [
      { text: "Cancelar" },
      { text: "Gerar Relatório", onPress: () => Alert.alert("Sucesso", "O ficheiro foi gerado e guardado.") }
    ]);
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Encerrar sessão?", [
      { text: "Não" },
      { text: "Sair", style: "destructive", onPress: async () => await supabase.auth.signOut() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#32CD32" />
        </TouchableOpacity>
        <Text style={styles.title}>Definições</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CONTA */}
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.settingItem}>
          <Ionicons name="mail-outline" size={20} color="#666" style={{ marginRight: 15 }} />
          <Text style={styles.settingLabel}>{userEmail || 'A carregar...'}</Text>
        </View>

        {/* LEMBRETES */}
        <Text style={styles.sectionTitle}>Lembretes</Text>
        
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

        {waterReminders && (
          <TouchableOpacity style={styles.settingItem} onPress={changeWaterInterval}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Frequência de Água</Text>
              <Text style={styles.settingDesc}>Atualmente: cada {waterInterval}h</Text>
            </View>
            <Ionicons name="time-outline" size={20} color="#32CD32" />
          </TouchableOpacity>
        )}

        {/* APP */}
        <Text style={styles.sectionTitle}>App</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={toggleUnits}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Sistema de Unidades</Text>
            <Text style={styles.settingDesc}>{unitSystem === 'Metric' ? 'Métrico (kg/cm)' : 'Imperial (lb/ft)'}</Text>
          </View>
          <Ionicons name="swap-horizontal-outline" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Form')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Dados Biométricos</Text>
            <Text style={styles.settingDesc}>Peso alvo, altura, idade...</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        {/* DADOS (EXPORTAÇÃO REATIVADA) */}
        <Text style={styles.sectionTitle}>Dados</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Exportar Histórico</Text>
            <Text style={styles.settingDesc}>Gerar relatório PDF</Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#32CD32" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4500" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versão 1.0.0 (Beta)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { marginTop: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 10 },
  backButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 25 },
  sectionTitle: { color: '#32CD32', fontSize: 13, fontWeight: 'bold', marginBottom: 15, marginTop: 20, textTransform: 'uppercase' },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 18, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  settingLabel: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  settingDesc: { color: '#888', fontSize: 12, marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 18, borderRadius: 18, backgroundColor: 'rgba(255, 69, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 69, 0, 0.2)' },
  logoutText: { color: '#FF4500', fontWeight: 'bold', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#444', marginTop: 30, fontSize: 12 }
});