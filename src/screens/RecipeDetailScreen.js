import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../services/supabase';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params;

  const adicionarRefeicao = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('refeicoes_hoje')
        .eq('id', user.id)
        .single();

      const novaRefeicaoIA = { 
        id: Math.random().toString(), 
        nome: recipe.title, 
        kcal: parseInt(recipe.kcal),
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const novaLista = [...(profile.refeicoes_hoje || []), novaRefeicaoIA];
      
      await supabase.from('profiles')
        .update({ refeicoes_hoje: novaLista })
        .eq('id', user.id);

      Alert.alert(
        "Sucesso! 🇵🇹", 
        "A receita foi adicionada à tua lista de hoje.",
        [{ text: "OK", onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (e) {
      Alert.alert("Erro", "Não foi possível guardar a refeição.");
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#FFF', fontSize: 20 }}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={[styles.typeBadge, { backgroundColor: recipe.type === 'Perder' ? '#E74C3C22' : '#32CD3222' }]}>
            <Text style={[styles.typeText, { color: recipe.type === 'Perder' ? '#E74C3C' : '#32CD32' }]}>
              Foco: {recipe.type} Peso
            </Text>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{recipe.kcal}</Text>
              <Text style={styles.macroLab}>Kcal</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{recipe.protein}g</Text>
              <Text style={styles.macroLab}>Prot</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{recipe.carbs}g</Text>
              <Text style={styles.macroLab}>HC</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroVal}>{recipe.fats}g</Text>
              <Text style={styles.macroLab}>Gord</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            {recipe.ingredients.map((ing, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{ing}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modo de Preparação</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={adicionarRefeicao}>
            <Text style={styles.addBtnText}>Adicionar ao meu Dia</Text>
          </TouchableOpacity>
          
          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  image: { width: '100%', height: 300 },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { flex: 1, backgroundColor: '#121212', marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 20 },
  typeText: { fontSize: 12, fontWeight: 'bold' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  macroBox: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 15, alignItems: 'center', width: '22%' },
  macroVal: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  macroLab: { color: '#666', fontSize: 10, marginTop: 4 },
  section: { marginBottom: 25 },
  sectionTitle: { color: '#32CD32', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#32CD32', marginRight: 10 },
  listText: { color: '#BBB', fontSize: 15, flex: 1, lineHeight: 22 },
  stepItem: { flexDirection: 'row', marginBottom: 15 },
  stepNumber: { color: '#32CD32', fontWeight: 'bold', fontSize: 18, marginRight: 15, width: 20 },
  addBtn: { backgroundColor: '#32CD32', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  addBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});