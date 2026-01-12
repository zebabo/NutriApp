import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function HistoryScreen({ route, navigation }) {
  const [listaHistorico, setListaHistorico] = useState(route.params.historico || []);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    obterPerfil();
  }, []);

  const obterPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('objetivo').eq('id', user.id).single();
      setPerfil(data);
    }
  };

  const calcularDiferenca = (index) => {
    const itemAtual = listaHistorico[listaHistorico.length - 1 - index];
    const itemAnterior = listaHistorico[listaHistorico.length - 2 - index];
    if (!itemAnterior) return null;
    return (parseFloat(itemAtual.peso) - parseFloat(itemAnterior.peso)).toFixed(1);
  };

  const totalPerdidoOuGanho = () => {
    if (listaHistorico.length < 2) return 0;
    const inicial = parseFloat(listaHistorico[0].peso);
    const atual = parseFloat(listaHistorico[listaHistorico.length - 1].peso);
    return (atual - inicial).toFixed(1);
  };

  const apagarRegisto = async (itemParaRemover) => {
    const novaLista = listaHistorico.filter(i => 
      !(i.data === itemParaRemover.data && i.peso === itemParaRemover.peso)
    );
    const novoPesoAtual = novaLista.length > 0 ? parseFloat(novaLista[novaLista.length - 1].peso) : 0;

    const { error } = await supabase.from('profiles')
      .update({ historico: novaLista, peso_atual: novoPesoAtual })
      .eq('id', (await supabase.auth.getUser()).data.user.id);

    if (!error) setListaHistorico(novaLista);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={24} color="#32CD32" />
        </TouchableOpacity>
        <Text style={styles.title}>Histórico</Text>
      </View>

      {/* RESUMO NO TOPO */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Variação Total</Text>
        <Text style={[styles.summaryValue, { color: totalPerdidoOuGanho() >= 0 ? '#32CD32' : '#FF4500' }]}>
          {totalPerdidoOuGanho() > 0 ? `+${totalPerdidoOuGanho()}` : totalPerdidoOuGanho()} kg
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {listaHistorico.slice().reverse().map((item, index) => {
          const diff = calcularDiferenca(index);
          const objetivo = perfil?.objetivo || 'Perder';

          // NOVA LÓGICA DE CORES:
          // Se objetivo é Perder: Perda (-) é VERDE, Ganho (+) é VERMELHO
          // Se objetivo é Ganhar: Ganho (+) é VERDE, Perda (-) é VERMELHO
          let corStatus = '#888';
          if (diff < 0) corStatus = objetivo === 'Perder' ? '#32CD32' : '#FF4500';
          if (diff > 0) corStatus = objetivo === 'Ganhar' ? '#32CD32' : '#FF4500';

          return (
            <View key={index} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{item.data}</Text>
                <Text style={styles.weight}>{item.peso} kg</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {diff !== null && (
                  <View style={[styles.diffBadge, { backgroundColor: corStatus + '20' }]}>
                    <Text style={[styles.diffText, { color: corStatus }]}>
                      {diff > 0 ? `+${diff}` : diff} kg
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => apagarRegisto(item)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { marginTop: 40, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  backCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#32CD32' },
  summaryLabel: { color: '#888', fontSize: 12, textTransform: 'uppercase' },
  summaryValue: { fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#1E1E1E', marginBottom: 10, borderRadius: 15 },
  date: { color: '#666', fontSize: 11 },
  weight: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
  diffText: { fontWeight: 'bold', fontSize: 13 },
  deleteBtn: { padding: 5 }
});