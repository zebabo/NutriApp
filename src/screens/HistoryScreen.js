import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/supabase";

export default function HistoryScreen({ navigation }) {
  const [listaHistorico, setListaHistorico] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("objetivo, historico, peso_atual")
        .eq("id", user.id)
        .single();

      if (data) {
        setPerfil(data);
        // Ordenar do mais antigo para o mais recente
        const hist = [...(data.historico || [])].sort((a, b) =>
          a.data.localeCompare(b.data),
        );
        setListaHistorico(hist);
      }
    } catch (e) {
      console.error("❌ [HistoryScreen] Erro:", e);
    } finally {
      setLoading(false);
    }
  };

  const calcularDiferenca = (index) => {
    const itemAtual = listaHistorico[listaHistorico.length - 1 - index];
    const itemAnterior = listaHistorico[listaHistorico.length - 2 - index];
    if (!itemAnterior) return null;
    return (parseFloat(itemAtual.peso) - parseFloat(itemAnterior.peso)).toFixed(
      1,
    );
  };

  const totalPerdidoOuGanho = () => {
    if (listaHistorico.length < 2) return 0;
    const inicial = parseFloat(listaHistorico[0].peso);
    const atual = parseFloat(listaHistorico[listaHistorico.length - 1].peso);
    return (atual - inicial).toFixed(1);
  };

  const apagarRegisto = async (itemParaRemover) => {
    const novaLista = listaHistorico.filter(
      (i) =>
        !(i.data === itemParaRemover.data && i.peso === itemParaRemover.peso),
    );
    const novoPesoAtual =
      novaLista.length > 0
        ? parseFloat(novaLista[novaLista.length - 1].peso)
        : 0;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ historico: novaLista, peso_atual: novoPesoAtual })
      .eq("id", user.id);

    if (!error) setListaHistorico(novaLista);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  const variacao = totalPerdidoOuGanho();
  const variacaoNum = parseFloat(variacao);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backCircle}
        >
          <Ionicons name="arrow-back" size={24} color="#32CD32" />
        </TouchableOpacity>
        <Text style={styles.title}>Histórico de Peso</Text>
      </View>

      {/* RESUMO */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Variação Total</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color:
                  variacaoNum === 0
                    ? "#888"
                    : variacaoNum > 0
                      ? "#FF4500"
                      : "#32CD32",
              },
            ]}
          >
            {variacaoNum > 0 ? "+" : ""}
            {variacao} kg
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Registos</Text>
          <Text style={styles.summaryValue}>{listaHistorico.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Objetivo</Text>
          <Text style={styles.summaryValue}>{perfil?.objetivo || "—"}</Text>
        </View>
      </View>

      {listaHistorico.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyText}>Sem registos de peso ainda.</Text>
          <Text style={styles.emptySubText}>
            Regista o teu peso no Dashboard para veres o histórico aqui.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {[...listaHistorico].reverse().map((item, index) => {
            const diff = calcularDiferenca(index);
            const diffNum = diff ? parseFloat(diff) : null;

            return (
              <View
                key={`${item.data}-${item.peso}-${index}`}
                style={styles.row}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowDate}>{formatDate(item.data)}</Text>
                  {diffNum !== null && (
                    <Text
                      style={[
                        styles.rowDiff,
                        { color: diffNum > 0 ? "#FF4500" : "#32CD32" },
                      ]}
                    >
                      {diffNum > 0 ? "▲" : "▼"} {Math.abs(diffNum)} kg
                    </Text>
                  )}
                </View>
                <Text style={styles.rowPeso}>
                  {parseFloat(item.peso).toFixed(1)} kg
                </Text>
                <TouchableOpacity
                  onPress={() => apagarRegisto(item)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={16} color="#555" />
                </TouchableOpacity>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 14,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#1E1E1E",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 4,
  },
  summaryLabel: {
    color: "#666",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  rowLeft: {
    flex: 1,
  },
  rowDate: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  rowDiff: {
    fontSize: 12,
    marginTop: 2,
  },
  rowPeso: {
    color: "#32CD32",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 16,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubText: {
    color: "#555",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
