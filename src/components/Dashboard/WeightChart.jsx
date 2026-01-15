/**
 * 📈 WEIGHT CHART
 * Gráfico de evolução de peso (últimos 7 dias)
 */

import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { CHART_DAYS_SHOWN } from '../../utils/dashboardConstants';
import { convertWeight } from '../../utils/nutritionCalculations';

export const WeightChart = ({ historico, unidade }) => {
  const prepareChartData = () => {
    if (!historico || historico.length === 0) {
      return {
        labels: ['-'],
        datasets: [{ data: [0] }],
      };
    }

    // Pegar últimos CHART_DAYS_SHOWN dias
    const recent = historico.slice(-CHART_DAYS_SHOWN);

    return {
      labels: recent.map((entry) => {
        const [day, month] = entry.data.split('-').slice(2, 4);
        return `${day}/${month}`;
      }),
      datasets: [
        {
          data: recent.map((entry) => {
            const pesoKg = parseFloat(entry.peso);
            return convertWeight(pesoKg, unidade);
          }),
        },
      ],
    };
  };

  const chartData = prepareChartData();
  const hasData = historico && historico.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Evolução 📈</Text>
        <Text style={styles.subtitle}>
          Últimos {CHART_DAYS_SHOWN} dias ({unidade === 'Metric' ? 'kg' : 'lb'})
        </Text>
      </View>

      {/* Chart */}
      {hasData ? (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 70}
          height={180}
          chartConfig={{
            backgroundColor: '#1E1E1E',
            backgroundGradientFrom: '#1E1E1E',
            backgroundGradientTo: '#1E1E1E',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
            labelColor: () => '#FFF',
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#32CD32',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: '#2A2A2A',
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Ainda não tens histórico suficiente.
          </Text>
          <Text style={styles.emptySubtext}>
            Regista o teu peso para ver a evolução!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
  },
  chart: {
    borderRadius: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});