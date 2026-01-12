import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function FormScreen({ navigation }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [gender, setGender] = useState('Masculino');
  const [activity, setActivity] = useState('1.2');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [unidade, setUnidade] = useState('Metric');

  const canGoBack = navigation.canGoBack();

  useEffect(() => {
    const inicializar = async () => {
      const savedUnit = await AsyncStorage.getItem('@unit_system');
      const unitValue = savedUnit || 'Metric';
      setUnidade(unitValue);
      await carregarPerfilExistente(unitValue);
    };
    inicializar();
  }, []);

  const carregarPerfilExistente = async (unidadeAtual) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (data) {
        if (unidadeAtual === 'Imperial') {
          setWeight((data.peso_atual * 2.20462).toFixed(1));
          setTargetWeight((data.peso_alvo * 2.20462).toFixed(1));
          setHeight((data.altura * 0.3937).toFixed(1)); // Converte CM para IN
        } else {
          setWeight(data.peso_atual?.toString() || '');
          setTargetWeight(data.peso_alvo?.toString() || '');
          setHeight(data.altura?.toString() || '');
        }
        setAge(data.idade?.toString() || '');
        setGender(data.sexo || 'Masculino');
        setActivity(data.fator_atividade?.toString() || '1.2');
      }
    } catch (e) { console.log("Erro:", e); }
    finally { setFetching(false); }
  };

  const salvarDados = async () => {
    if (!weight || !height || !age || !targetWeight) {
      Alert.alert("Erro", "Preenche todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let pAtual = parseFloat(weight.replace(',', '.'));
      let pAlvo = parseFloat(targetWeight.replace(',', '.'));
      let vAlt = parseFloat(height.replace(',', '.'));

      // CONVERSÃO PARA SISTEMA MÉTRICO ANTES DE GUARDAR NA BD
      if (unidade === 'Imperial') {
        pAtual = pAtual / 2.20462;
        pAlvo = pAlvo / 2.20462;
        vAlt = vAlt / 0.3937; // Converte IN de volta para CM
      }

      let goal = pAlvo < pAtual ? 'Perder' : (pAlvo > pAtual ? 'Ganhar' : 'Manter');

      const updates = {
        id: user.id,
        nome: user.user_metadata?.full_name || 'Utilizador',
        idade: parseInt(age),
        peso_atual: parseFloat(pAtual.toFixed(2)),
        peso_alvo: parseFloat(pAlvo.toFixed(2)),
        altura: parseFloat(vAlt.toFixed(1)),
        sexo: gender,
        objetivo: goal,
        fator_atividade: activity,
        ultima_data: new Date().toLocaleDateString()
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert("Sucesso", "Perfil atualizado!");
      canGoBack ? navigation.goBack() : navigation.navigate('Dashboard');

    } catch (error) { Alert.alert("Erro ao salvar", error.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <View style={[styles.mainWrapper, { justifyContent: 'center' }]}><ActivityIndicator color="#32CD32" size="large" /></View>;

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.header}>
        {canGoBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#32CD32" />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { textAlign: canGoBack ? 'left' : 'center', flex: 1 }]}>Dados Biométricos 🌱</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Idade</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge} placeholder="25" placeholderTextColor="#666" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Sexo</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity style={[styles.smallButton, gender === 'Masculino' && styles.activeButton]} onPress={() => setGender('Masculino')}><Text style={styles.buttonText}>M</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.smallButton, gender === 'Feminino' && styles.activeButton]} onPress={() => setGender('Feminino')}><Text style={styles.buttonText}>F</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Peso Atual ({unidade === 'Metric' ? 'kg' : 'lb'})</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="80" placeholderTextColor="#666" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.label}>Peso Alvo ({unidade === 'Metric' ? 'kg' : 'lb'})</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={targetWeight} onChangeText={setTargetWeight} placeholder="70" placeholderTextColor="#666" />
            </View>
          </View>

          <Text style={styles.label}>Altura ({unidade === 'Metric' ? 'cm' : 'in'})</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} placeholder={unidade === 'Metric' ? "180" : "70"} placeholderTextColor="#666" />

          <Text style={styles.label}>Nível de Atividade</Text>
          <View style={styles.column}>
            {[{v: '1.2', t: 'Sedentário'}, {v: '1.5', t: 'Moderado'}, {v: '1.7', t: 'Intenso'}].map((level) => (
              <TouchableOpacity key={level.v} style={[styles.activityButton, activity === level.v && styles.activeButton]} onPress={() => setActivity(level.v)}>
                <Text style={styles.buttonText}>{level.t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={salvarDados} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.mainButtonText}>GUARDAR PERFIL</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#121212' },
  header: { marginTop: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 0 },
  backButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: '#333' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 25, paddingBottom: 70 },
  formCard: { width: '100%' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  label: { color: '#32CD32', fontSize: 13, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#1E1E1E', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 10, justifyContent: 'space-between' },
  flex1: { flex: 1, marginRight: 8 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallButton: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  activityButton: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  activeButton: { borderColor: '#32CD32', backgroundColor: '#1A331A' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  mainButton: { backgroundColor: '#32CD32', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 15 },
  mainButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});