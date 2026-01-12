import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  FlatList, Image, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { receitasPortuguesas } from '../../data/receitasDB';
import { supabase } from '../services/supabase';

export default function RecipesScreen({ navigation }) {
  const [objetivo, setObjetivo] = useState('Perder');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Pequeno-almoço');
  const [receitasFiltradas, setReceitasFiltradas] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [favoritos, setFavoritos] = useState([]);

  const categorias = ['Favoritos', 'Pequeno-almoço', 'Almoço', 'Lanche', 'Jantar'];

  useFocusEffect(
    useCallback(() => {
      carregarDadosSupabase();
    }, [categoriaAtiva, pesquisa])
  );

  const carregarDadosSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('objetivo, receitas_favoritas')
        .eq('id', user.id)
        .single();

      if (profile) {
        setObjetivo(profile.objetivo);
        const listaFavs = profile.receitas_favoritas || [];
        setFavoritos(listaFavs);
        filtrarLógica(profile.objetivo, listaFavs);
      }
    } catch (e) {
      console.log("Erro ao carregar dados do Supabase", e);
    }
  };

  const filtrarLógica = (objDoUsuario, listaFavs) => {
    // 1. Primeiro filtramos pela categoria ou favoritos
    let filtradas = receitasPortuguesas.filter(r => {
      const combinaBusca = r.title.toLowerCase().includes(pesquisa.toLowerCase());
      const eFavorito = listaFavs.includes(r.id);

      if (pesquisa.length > 0) return combinaBusca;
      if (categoriaAtiva === 'Favoritos') return eFavorito;
      
      return r.category === categoriaAtiva;
    });

    // 2. Lógica de Prioridade: Ordenamos para que as receitas do teu OBJETIVO apareçam primeiro
    // Não removemos as outras, apenas damos destaque às que combinam com "Ganhar" ou "Perder"
    const ordenadas = filtradas.sort((a, b) => {
      if (a.type === objDoUsuario && b.type !== objDoUsuario) return -1;
      if (a.type !== objDoUsuario && b.type === objDoUsuario) return 1;
      return 0;
    });

    setReceitasFiltradas(ordenadas);
  };

  const alternarFavorito = async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    let novaLista = [...favoritos];
    
    if (novaLista.includes(id)) {
      novaLista = novaLista.filter(favId => favId !== id);
    } else {
      novaLista.push(id);
    }
    
    setFavoritos(novaLista);
    await supabase.from('profiles').update({ receitas_favoritas: novaLista }).eq('id', user.id);
    
    if (categoriaAtiva === 'Favoritos') {
      filtrarLógica(objetivo, novaLista);
    }
  };

  const renderReceita = ({ item }) => {
    const isFav = favoritos.includes(item.id);
    const isIdeal = item.type === objetivo; // Verifica se a receita é ideal para o foco do user

    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      >
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <View style={styles.overlay} />
        
        {/* Badge de Recomendação */}
        {isIdeal && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>IDEAL PARA {objetivo.toUpperCase()}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.favButton} 
          onPress={() => alternarFavorito(item.id)}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#FF4444" : "#FFF"} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.catTag}>{item.category} • {item.type}</Text>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <Text style={styles.macroText}>🔥 {item.kcal} kcal | 💪 {item.protein}g Proteína</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Cozinha Lusa 🇵🇹</Text>
        <View style={styles.userGoalBadge}>
          <Text style={styles.userGoalText}>FOCO: {objetivo}</Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar receitas..."
          placeholderTextColor="#666"
          value={pesquisa}
          onChangeText={setPesquisa}
        />
      </View>

      {pesquisa.length === 0 && (
        <View style={{ height: 50, marginBottom: 20 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categorias.map(cat => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setCategoriaAtiva(cat)}
                style={[styles.tab, categoriaAtiva === cat && styles.tabActive]}
              >
                <Text style={[styles.tabText, categoriaAtiva === cat && styles.tabTextActive]}>
                  {cat === 'Favoritos' ? `❤️ ${cat}` : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={receitasFiltradas}
        keyExtractor={item => item.id}
        renderItem={renderReceita}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {categoriaAtiva === 'Favoritos' 
              ? "Ainda não tens receitas favoritas." 
              : "Nenhuma receita encontrada para esta categoria."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 15 },
  header: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userGoalBadge: { backgroundColor: '#1A331A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#32CD32' },
  userGoalText: { color: '#32CD32', fontSize: 10, fontWeight: 'bold' },
  searchContainer: {
    backgroundColor: '#1E1E1E', borderRadius: 15, paddingHorizontal: 15,
    marginBottom: 20, height: 50, justifyContent: 'center', borderWidth: 1, borderColor: '#333'
  },
  searchInput: { color: '#FFF', fontSize: 16 },
  tab: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, borderRadius: 20, backgroundColor: '#1E1E1E', height: 40 },
  tabActive: { backgroundColor: '#32CD32' },
  tabText: { color: '#666', fontWeight: 'bold' },
  tabTextActive: { color: '#000' },
  recipeCard: { height: 180, borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 5 },
  recipeImage: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  recommendedBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: '#32CD32', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, zIndex: 10 },
  recommendedText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  favButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  content: { flex: 1, justifyContent: 'flex-end', padding: 15 },
  catTag: { color: '#32CD32', fontSize: 10, fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  recipeTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  macroText: { color: '#DDD', fontSize: 12, marginTop: 5 },
  empty: { color: '#666', textAlign: 'center', marginTop: 50 }
});