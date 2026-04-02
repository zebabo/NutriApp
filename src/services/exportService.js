/**
 * 📄 EXPORT SERVICE
 * Gera PDF com histórico de peso, refeições dos últimos 7 dias e resumo calórico
 * Usa expo-print (gerar) + expo-sharing (partilhar)
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { supabase } from "./supabase";

// ─── Buscar dados ─────────────────────────────────────────────────────────────

const fetchDados = async (userId) => {
  const [profileRes, logsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome, peso_atual, peso_alvo, objetivo, historico")
      .eq("id", userId)
      .single(),
    supabase
      .from("daily_logs")
      .select("date, meals, water_ml")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(14),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (logsRes.error) throw logsRes.error;

  return { perfil: profileRes.data, logs: logsRes.data || [] };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const totalKcal = (meals) =>
  (meals || []).reduce((sum, r) => sum + (r.kcal || 0), 0);

// ─── HTML do relatório ────────────────────────────────────────────────────────

const buildHtml = (perfil, logs) => {
  const hoje = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Histórico de peso (últimas 30 entradas, mais recentes primeiro)
  const historico = [...(perfil.historico || [])].reverse().slice(0, 30);

  // Logs ordenados (mais recentes primeiro)
  const logsOrdenados = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  // Resumo calórico — médias por dia
  const totalDias = logsOrdenados.length;
  const totalKcalGeral = logsOrdenados.reduce(
    (s, l) => s + totalKcal(l.meals),
    0,
  );
  const mediaKcal = totalDias > 0 ? Math.round(totalKcalGeral / totalDias) : 0;
  const totalAgua = logsOrdenados.reduce((s, l) => s + (l.water_ml || 0), 0);
  const mediaAgua = totalDias > 0 ? Math.round(totalAgua / totalDias) : 0;

  // Variação de peso
  const pesoInicial =
    historico.length > 1
      ? parseFloat(historico[historico.length - 1].peso)
      : null;
  const pesoAtual = perfil.peso_atual;
  const variacao = pesoInicial ? (pesoAtual - pesoInicial).toFixed(1) : null;

  // Linhas do histórico de peso
  const pessoRows = historico
    .map(
      (h) => `
    <tr>
      <td>${formatDate(h.data)}</td>
      <td>${parseFloat(h.peso).toFixed(1)} kg</td>
    </tr>`,
    )
    .join("");

  // Secções de refeições por dia
  const refeicoesSections = logsOrdenados
    .slice(0, 7)
    .map((log) => {
      const meals = log.meals || [];
      const kcalDia = totalKcal(meals);
      const mealsRows =
        meals.length > 0
          ? meals
              .map(
                (m) => `
          <tr>
            <td>${m.hora || "—"}</td>
            <td>${m.nome}</td>
            <td>${m.kcal} kcal</td>
          </tr>`,
              )
              .join("")
          : `<tr><td colspan="3" style="text-align:center;color:#999;">Sem refeições registadas</td></tr>`;

      return `
      <div class="day-section">
        <div class="day-header">
          <span>${formatDate(log.date)}</span>
          <span>${kcalDia} kcal · ${log.water_ml || 0} ml água</span>
        </div>
        <table>
          <thead><tr><th>Hora</th><th>Alimento</th><th>Calorias</th></tr></thead>
          <tbody>${mealsRows}</tbody>
        </table>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 32px; font-size: 13px; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #32CD32; padding-bottom: 20px; margin-bottom: 28px; }
    .header-logo { font-size: 22px; font-weight: 800; color: #32CD32; letter-spacing: -0.5px; }
    .header-logo span { color: #1a1a1a; }
    .header-meta { text-align: right; color: #888; font-size: 12px; line-height: 1.6; }
    .header-meta strong { color: #1a1a1a; }

    /* Perfil resumo */
    .profile-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
    .pcard { background: #f8f8f8; border-radius: 10px; padding: 14px; text-align: center; border-left: 3px solid #32CD32; }
    .pcard-val { font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .pcard-lbl { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 3px; }

    /* Secções */
    h2 { font-size: 14px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
    .section { margin-bottom: 32px; }

    /* Resumo calórico */
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10px; }
    .scard { background: #f8f8f8; border-radius: 10px; padding: 16px; text-align: center; }
    .scard-val { font-size: 22px; font-weight: 700; color: #32CD32; }
    .scard-lbl { font-size: 11px; color: #888; margin-top: 4px; }

    /* Tabelas */
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f0fdf0; color: #32CD32; font-weight: 600; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; color: #333; }
    tr:last-child td { border-bottom: none; }

    /* Days */
    .day-section { margin-bottom: 20px; border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
    .day-header { display: flex; justify-content: space-between; background: #f8f8f8; padding: 10px 14px; font-weight: 600; font-size: 12px; color: #333; }

    /* Variação */
    .variacao-pos { color: #32CD32; font-weight: 700; }
    .variacao-neg { color: #e74c3c; font-weight: 700; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; color: #bbb; font-size: 11px; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="header-logo">Smart<span>Nutrition</span></div>
      <div style="color:#888;font-size:12px;margin-top:4px;">Relatório de Progresso</div>
    </div>
    <div class="header-meta">
      <strong>${perfil.nome || "Utilizador"}</strong><br/>
      Objetivo: ${perfil.objetivo || "—"}<br/>
      Gerado em ${hoje}
    </div>
  </div>

  <!-- Cartões de perfil -->
  <div class="profile-cards">
    <div class="pcard">
      <div class="pcard-val">${pesoAtual ? pesoAtual.toFixed(1) + " kg" : "—"}</div>
      <div class="pcard-lbl">Peso Atual</div>
    </div>
    <div class="pcard">
      <div class="pcard-val">${perfil.peso_alvo ? perfil.peso_alvo.toFixed(1) + " kg" : "—"}</div>
      <div class="pcard-lbl">Peso Alvo</div>
    </div>
    <div class="pcard">
      <div class="pcard-val ${variacao ? (parseFloat(variacao) <= 0 && perfil.objetivo === "Perder" ? "variacao-pos" : "variacao-neg") : ""}">
        ${variacao ? (parseFloat(variacao) > 0 ? "+" : "") + variacao + " kg" : "—"}
      </div>
      <div class="pcard-lbl">Variação Total</div>
    </div>
    <div class="pcard">
      <div class="pcard-val">${totalDias}</div>
      <div class="pcard-lbl">Dias Registados</div>
    </div>
  </div>

  <!-- Resumo Calórico -->
  <div class="section">
    <h2>📊 Resumo (últimos ${totalDias} dias)</h2>
    <div class="summary-grid">
      <div class="scard">
        <div class="scard-val">${mediaKcal}</div>
        <div class="scard-lbl">Média kcal/dia</div>
      </div>
      <div class="scard">
        <div class="scard-val">${mediaAgua} ml</div>
        <div class="scard-lbl">Média água/dia</div>
      </div>
      <div class="scard">
        <div class="scard-val">${totalKcalGeral}</div>
        <div class="scard-lbl">Total kcal registadas</div>
      </div>
    </div>
  </div>

  <!-- Histórico de Peso -->
  <div class="section">
    <h2>⚖️ Histórico de Peso</h2>
    ${
      historico.length > 0
        ? `<table>
          <thead><tr><th>Data</th><th>Peso</th></tr></thead>
          <tbody>${pessoRows}</tbody>
        </table>`
        : '<p style="color:#999;font-size:12px;">Sem registos de peso.</p>'
    }
  </div>

  <!-- Refeições por dia -->
  <div class="section">
    <h2>🍽️ Refeições (últimos 7 dias)</h2>
    ${refeicoesSections || '<p style="color:#999;font-size:12px;">Sem refeições registadas.</p>'}
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>SmartNutrition App</span>
    <span>Relatório gerado automaticamente</span>
  </div>

</body>
</html>`;
};

// ─── Função principal ─────────────────────────────────────────────────────────

export const exportarRelatorio = async (userId) => {
  try {
    const { perfil, logs } = await fetchDados(userId);
    const html = buildHtml(perfil, logs);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const podePartilhar = await Sharing.isAvailableAsync();
    if (!podePartilhar) {
      Alert.alert("Erro", "Partilha não disponível neste dispositivo.");
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "Exportar Relatório SmartNutrition",
      UTI: "com.adobe.pdf",
    });
  } catch (e) {
    console.error("❌ [exportarRelatorio]:", e);
    Alert.alert("Erro", "Não foi possível gerar o relatório.");
  }
};
