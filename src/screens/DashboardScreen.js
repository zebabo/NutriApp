import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Alert, Dimensions, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { supabase } from '../services/supabase';

export default function DashboardScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [caloriasAlvo, setCaloriasAlvo] = useState(0);
  const [macros, setMacros] = useState({ proteina: 0, hidratos: 0, gordura: 0 });
  const [novoPeso, setNovoPeso] = useState('');
  const [alimentoNome, setAlimentoNome] = useState('');
  const [alimentoKcal, setAlimentoKcal] = useState('');
  const [metaAtingida, setMetaAtingida] = useState(false);
  const [unidade, setUnidade] = useState('Metric');
  const metaAgua = 2500;

  useFocusEffect(
    useCallback(() => {
      carregarPreferencias();
      carregarDados();
    }, [])
  );

  const carregarPreferencias = async () => {
    const savedUnit = await AsyncStorage.getItem('@unit_system');
    if (savedUnit) setUnidade(savedUnit);
  };

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileDB, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileDB) {
        const hoje = new Date().toLocaleDateString();
        let dadosTratados = { ...profileDB };

        if (profileDB.ultima_data !== hoje) {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ agua_hoje: 0, refeicoes_hoje: [], ultima_data: hoje })
            .eq('id', user.id)
            .select()
            .single();

          if (!updateError) {
            dadosTratados = updatedProfile;
            console.log("✅ Dia reiniciado com sucesso!");
          }
        }

        const obj = {
          ...dadosTratados,
          pesoAtual: dadosTratados.peso_atual,
          pesoAlvo: dadosTratados.peso_alvo,
          fatorAtividade: dadosTratados.fator_atividade,
          historico: dadosTratados.historico || [{ data: hoje, peso: dadosTratados.peso_atual }]
        };
        
        setPerfil(obj);
        calcularTudo(obj);
      }
    } catch (e) { console.log("Erro ao carregar dados/reset:", e); }
  };

  const calcularTudo = (dados) => {
    const peso = parseFloat(dados.pesoAtual);
    const altura = parseFloat(dados.altura);
    const idade = parseInt(dados.idade);
    const fatorAtividade = parseFloat(dados.fatorAtividade);
    const pesoAlvo = parseFloat(dados.pesoAlvo);

    let tmb = (10 * peso) + (6.25 * altura) - (5 * idade);
    tmb = dados.sexo === 'Masculino' ? tmb + 5 : tmb - 161;

    const manutencao = tmb * fatorAtividade;
    let totalKcal = manutencao;
    let atingiu = false;

    if (dados.objetivo === 'Ganhar') {
      if (peso >= pesoAlvo) { atingiu = true; totalKcal = manutencao; }
      else { totalKcal = manutencao * 1.15; }
    } else if (dados.objetivo === 'Perder') {
      if (peso <= pesoAlvo) { atingiu = true; totalKcal = manutencao; }
      else { totalKcal = manutencao * 0.85; }
    }

    setMetaAtingida(atingiu);
    setCaloriasAlvo(Math.round(totalKcal));
    
    const protGrams = peso * 2; 
    const fatGrams = peso * 0.8; 
    const carbKcal = totalKcal - ((protGrams * 4) + (fatGrams * 9));
    const carbGrams = carbKcal / 4;

    setMacros({
      proteina: Math.round(protGrams),
      gordura: Math.round(fatGrams),
      hidratos: Math.max(0, Math.round(carbGrams))
    });
  };

  const exibirPeso = (valorKg) => {
    const num = parseFloat(valorKg);
    if (isNaN(num)) return "--";
    return unidade === 'Imperial' ? (num * 2.20462).toFixed(1) : num.toFixed(1);
  };

  const obterSugestaoIA = () => {
    const hora = new Date().getHours();
    const obj = perfil?.objetivo || 'Manter';
    const dicas = {
      'Ganhar': { manha: "Panquecas de aveia! 🥞", almoco: "150g+ de proteína. 💪", foco: "Não saltar refeições! 📈" },
      'Perder': { manha: "Fibras e ovos. 🍳", almoco: "Metade do prato com vegetais. 🥗", foco: "Foco no défice! 📉" },
      'Manter': { manha: "Equilíbrio: Fruta e iogurte. 🍏", almoco: "Mantém as porções. ✨", foco: "Consistência é o segredo. ⚖️" }
    };
    if (hora >= 5 && hora < 12) return { titulo: "Pequeno-almoço ☕", dica: dicas[obj].manha };
    if (hora >= 12 && hora < 15) return { titulo: "Almoço 🥗", dica: dicas[obj].almoco };
    return { titulo: `Dica de Foco (${obj}) 🎯`, dica: dicas[obj].foco };
  };

  const adicionarAgua = async (qtd) => {
    const novoTotal = (perfil.agua_hoje || 0) + qtd;
    const { error } = await supabase.from('profiles').update({ agua_hoje: novoTotal }).eq('id', perfil.id);
    if (!error) setPerfil({ ...perfil, agua_hoje: novoTotal });
  };

  const resetAgua = async () => {
    Alert.alert("Reset", "Zerar água?", [{ text: "Não" }, { text: "Sim", onPress: async () => {
      const { error } = await supabase.from('profiles').update({ agua_hoje: 0 }).eq('id', perfil.id);
      if (!error) setPerfil({ ...perfil, agua_hoje: 0 });
    }}]);
  };

  const adicionarAlimento = async () => {
    if (!alimentoNome || !alimentoKcal) return;
    const novo = { id: Math.random().toString(), nome: alimentoNome, kcal: parseInt(alimentoKcal), hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const lista = [...(perfil.refeicoes_hoje || []), novo];
    const { error } = await supabase.from('profiles').update({ refeicoes_hoje: lista }).eq('id', perfil.id);
    if (!error) { setPerfil({ ...perfil, refeicoes_hoje: lista }); setAlimentoNome(''); setAlimentoKcal(''); }
  };

  const removerAlimento = async (id) => {
    const lista = perfil.refeicoes_hoje.filter(item => item.id !== id);
    const { error } = await supabase.from('profiles').update({ refeicoes_hoje: lista }).eq('id', perfil.id);
    if (!error) setPerfil({ ...perfil, refeicoes_hoje: lista });
  };

  const registarPeso = async () => {
    if (!novoPeso) return;
    let pesoKg = parseFloat(novoPeso.replace(',', '.'));
    if (unidade === 'Imperial') pesoKg = pesoKg / 2.20462;

    const hoje = new Date().toLocaleDateString();
    const novoHist = [...(perfil.historico || []), { data: hoje, peso: pesoKg.toFixed(2) }];
    const { error } = await supabase.from('profiles').update({ peso_atual: pesoKg, historico: novoHist }).eq('id', perfil.id);
    
    if (!error) {
      const atualizado = { ...perfil, pesoAtual: pesoKg, historico: novoHist };
      setPerfil(atualizado);
      calcularTudo(atualizado);
      setNovoPeso('');
      Alert.alert("Sucesso", "Peso atualizado!");
    }
  };

  const prepararDadosGrafico = () => {
    const h = perfil?.historico || [];
    const ultimos = h.slice(-5);
    if (ultimos.length === 0) return { labels: ["-"], datasets: [{ data: [0] }] };
    return {
      labels: ultimos.map(d => d.data.split('/')[0] + '/' + d.data.split('/')[1]),
      datasets: [{ data: ultimos.map(d => {
        const p = parseFloat(d.peso);
        return unidade === 'Imperial' ? (p * 2.20462) : p;
      }) }]
    };
  };

  const consumidas = perfil?.refeicoes_hoje?.reduce((t, i) => t + i.kcal, 0) || 0;
  const faltam = caloriasAlvo - consumidas;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>O Teu Dashboard ⚡</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.btnSettings}>
          <Ionicons name="settings-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabActive}><Text style={styles.tabTextActive}>Dashboard</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabInactive} onPress={() => navigation.navigate('Recipes')}><Text style={styles.tabTextInactive}>Receitas 📖</Text></TouchableOpacity>
      </View>

      {metaAtingida && (
        <View style={styles.achievementCard}>
          <Ionicons name="trophy" size={20} color="#FFD700" /><Text style={styles.achievementText}>Meta Atingida! Modo Manutenção Ativo 🏆</Text>
        </View>
      )}

      <View style={styles.iaCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={styles.iaTitle}>{obterSugestaoIA().titulo}</Text>
          <Text style={styles.objBadge}>{perfil?.objetivo}</Text>
        </View>
        <Text style={styles.iaDica}>{obterSugestaoIA().dica}</Text>
      </View>

      <View style={styles.waterCard}>
        <View><Text style={styles.waterTitle}>Água 💧</Text><View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.waterText}>{perfil?.agua_hoje || 0}/{metaAgua}ml</Text>
            <TouchableOpacity onPress={resetAgua} style={styles.resetWaterBtn}><Ionicons name="refresh-outline" size={14} color="#4FC3F7" /></TouchableOpacity>
        </View></View>
        <TouchableOpacity onPress={() => adicionarAgua(250)} style={styles.waterBtn}><Text style={styles.waterBtnText}>+250ml</Text></TouchableOpacity>
      </View>

      <View style={styles.cardCalorias}>
        <View style={styles.calInfoRow}>
          <View style={styles.calBox}><Text style={styles.calSubValue}>{caloriasAlvo}</Text><Text style={styles.calLabelText}>Meta</Text></View>
          <Text style={styles.calOp}>-</Text>
          <View style={styles.calBox}><Text style={styles.calSubValue}>{consumidas}</Text><Text style={styles.calLabelText}>Comido</Text></View>
          <Text style={styles.calOp}>=</Text>
          <View style={styles.calBox}><Text style={[styles.calMainValue, { color: faltam < 0 ? '#FF4500' : '#32CD32' }]}>{faltam}</Text><Text style={styles.calLabelText}>{faltam < 0 ? 'Excesso' : 'Restantes'}</Text></View>
        </View>
      </View>

      <View style={styles.macrosRow}>
        <View style={styles.macroBox}><Text style={styles.macroValue}>{macros.proteina}g</Text><Text style={styles.macroLabel}>Proteína</Text></View>
        <View style={styles.macroBox}><Text style={styles.macroValue}>{macros.hidratos}g</Text><Text style={styles.macroLabel}>Hidratos</Text></View>
        <View style={styles.macroBox}><Text style={styles.macroValue}>{macros.gordura}g</Text><Text style={styles.macroLabel}>Gordura</Text></View>
      </View>

      <View style={styles.refeicaoInputCard}><View style={styles.inputRow}>
          <TextInput style={[styles.weightInput, {flex: 2}]} placeholder="Alimento..." placeholderTextColor="#666" value={alimentoNome} onChangeText={setAlimentoNome} />
          <TextInput style={[styles.weightInput, {flex: 1, marginLeft: 10}]} placeholder="Kcal" keyboardType="numeric" placeholderTextColor="#666" value={alimentoKcal} onChangeText={setAlimentoKcal} />
          <TouchableOpacity style={styles.btnRegistarPlus} onPress={adicionarAlimento}><Text style={styles.btnText}>+</Text></TouchableOpacity>
      </View></View>

      {perfil?.refeicoes_hoje?.length > 0 && (
        <View style={styles.todayCard}>{perfil.refeicoes_hoje.map((item) => (
            <View key={item.id} style={styles.todayItem}><View style={{ flex: 1 }}>
                <Text style={styles.todayText}>{item.nome} ({item.hora})</Text><Text style={styles.todayKcal}>{item.kcal} kcal</Text>
              </View><TouchableOpacity onPress={() => removerAlimento(item.id)}><Ionicons name="trash-outline" size={18} color="#FF4500" /></TouchableOpacity>
            </View>
        ))}</View>
      )}

      <Text style={styles.sectionTitle}>Análise ({unidade === 'Metric' ? 'kg' : 'lb'})</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={prepararDadosGrafico()}
          width={Dimensions.get("window").width - 40}
          height={160}
          chartConfig={{
            backgroundColor: "#1E1E1E", backgroundGradientFrom: "#1E1E1E", backgroundGradientTo: "#1E1E1E",
            decimalPlaces: 1, color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`, labelColor: () => `#FFF`
          }}
          bezier style={{ borderRadius: 15 }}
        />
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressInfo}>
          <View>
             <Text style={styles.weightDisplay}>{exibirPeso(perfil?.pesoAtual)}{unidade === 'Metric' ? 'kg' : 'lb'}</Text>
             <Text style={styles.remainingText}>Meta: {exibirPeso(perfil?.pesoAlvo)}{unidade === 'Metric' ? 'kg' : 'lb'}</Text>
          </View>
          {metaAtingida && <Ionicons name="checkmark-circle" size={32} color="#32CD32" />}
        </View>
        <View style={styles.inputRow}>
          <TextInput style={styles.weightInput} keyboardType="numeric" value={novoPeso} onChangeText={setNovoPeso} placeholder={`Novo peso em ${unidade === 'Metric' ? 'kg' : 'lb'}...`} placeholderTextColor="#666" />
          <TouchableOpacity style={styles.btnRegistar} onPress={registarPeso}><Text style={styles.btnText}>OK</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Histórico</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History', { historico: perfil?.historico })}>
          <Text style={styles.verTudoText}>Ver Tudo +</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { marginTop: 60, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  btnSettings: { backgroundColor: '#1E1E1E', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 5, marginBottom: 20 },
  tabActive: { flex: 1, backgroundColor: '#32CD32', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabInactive: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabTextActive: { color: '#000', fontWeight: 'bold' },
  tabTextInactive: { color: '#666', fontWeight: 'bold' },
  achievementCard: { backgroundColor: 'rgba(255, 215, 0, 0.1)', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)' },
  achievementText: { color: '#FFD700', marginLeft: 10, fontWeight: 'bold', fontSize: 13 },
  iaCard: { backgroundColor: '#1E1E1E', padding: 18, borderRadius: 20, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#32CD32' },
  iaTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  objBadge: { color: '#32CD32', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: '#1A331A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  iaDica: { color: '#BBB', fontSize: 13, marginTop: 5 },
  waterCard: { backgroundColor: '#1A2A3A', padding: 15, borderRadius: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterTitle: { color: '#4FC3F7', fontWeight: 'bold', fontSize: 12 },
  waterText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resetWaterBtn: { marginLeft: 10, padding: 4, backgroundColor: 'rgba(79, 195, 247, 0.1)', borderRadius: 20 },
  waterBtn: { backgroundColor: '#4FC3F7', padding: 10, borderRadius: 8 },
  waterBtnText: { color: '#000', fontWeight: 'bold' },
  cardCalorias: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, marginBottom: 10 },
  calInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calBox: { alignItems: 'center', flex: 1 },
  calSubValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  calMainValue: { fontSize: 32, fontWeight: 'bold' },
  calLabelText: { color: '#666', fontSize: 10, marginTop: 4 },
  calOp: { color: '#333', fontSize: 20 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  macroBox: { backgroundColor: '#1E1E1E', width: '31%', padding: 12, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  macroValue: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  macroLabel: { color: '#32CD32', fontSize: 9, marginTop: 4, textTransform: 'uppercase' },
  refeicaoInputCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 15, marginBottom: 15 },
  inputRow: { flexDirection: 'row' },
  weightInput: { flex: 1, backgroundColor: '#121212', color: '#FFF', padding: 12, borderRadius: 10 },
  btnRegistarPlus: { backgroundColor: '#32CD32', width: 45, height: 45, borderRadius: 10, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  todayCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 15, marginBottom: 15 },
  todayItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  todayText: { color: '#DDD', fontSize: 13 },
  todayKcal: { color: '#FFF', fontWeight: 'bold' },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  chartCard: { backgroundColor: '#1E1E1E', borderRadius: 20, marginBottom: 20, alignItems: 'center', padding: 15 },
  progressCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, marginBottom: 20 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  weightDisplay: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  remainingText: { color: '#32CD32', fontSize: 14 },
  btnRegistar: { backgroundColor: '#32CD32', paddingHorizontal: 20, borderRadius: 10, marginLeft: 10, justifyContent: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  verTudoText: { color: '#32CD32', fontSize: 12 }
});