/**
 * 🌱 FORM SCREEN - VERSÃO DEFINITIVA
 * 
 * APENAS JSX PURO!
 * - Lógica → useProfileForm hook
 * - Componentes → Form/
 * - Estilos → inline mínimos
 */

import { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityLevelSelector } from '../components/Form/ActivityLevelSelector';
import { BMICard } from '../components/Form/BMICard';
import { FormHeader } from '../components/Form/FormHeader';
import { FormInput } from '../components/Form/FormInput';
import { GenderSelector } from '../components/Form/GenderSelector';
import { SaveButton } from '../components/Form/SaveButton';
import { useProfileForm } from '../hooks/useProfileForm';

export default function FormScreen({ navigation }) {
  // Custom hook → TODA a lógica
  const {
    weight, setWeight,
    height, setHeight,
    age, setAge,
    targetWeight, setTargetWeight,
    gender, setGender,
    activity, setActivity,
    unidade,
    loading,
    fetching,
    errors,
    touched,
    canGoBack,
    handleFieldChange,
    handleBlur,
    salvarDados,
    currentBMI,
    bmiCategory,
    healthyRange,
  } = useProfileForm(navigation);

  // Refs para navegação
  const heightRef = useRef(null);
  const weightRef = useRef(null);
  const targetWeightRef = useRef(null);

  // Loading
  if (fetching) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#32CD32" size="large" />
      </View>
    );
  }

  // Formulário
  return (
    <View style={styles.container}>
      
      <FormHeader
        title="Dados Biométricos 🌱"
        onBack={() => navigation.goBack()}
        showBackButton={canGoBack}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Idade e Sexo */}
        <View style={styles.row}>
          <FormInput
            label="Idade *"
            value={age}
            onChangeText={(val) => handleFieldChange('age', val, setAge)}
            onBlur={() => handleBlur('age')}
            error={errors.age}
            touched={touched.age}
            placeholder="25"
            keyboardType="numeric"
            maxLength={3}
            returnKeyType="next"
            onSubmitEditing={() => heightRef.current?.focus()}
            autoFocus={!canGoBack}
            style={styles.flex1}
          />
          <GenderSelector value={gender} onChange={setGender} />
        </View>

        {/* Altura */}
        <FormInput
          label={`Altura (${unidade === 'Metric' ? 'cm' : 'in'}) *`}
          value={height}
          onChangeText={(val) => handleFieldChange('height', val, setHeight)}
          onBlur={() => handleBlur('height')}
          error={errors.height}
          touched={touched.height}
          placeholder={unidade === 'Metric' ? "180" : "70"}
          keyboardType="numeric"
          maxLength={5}
          returnKeyType="next"
          onSubmitEditing={() => weightRef.current?.focus()}
          inputRef={heightRef}
        />

        {/* Pesos */}
        <View style={styles.row}>
          <FormInput
            label={`Peso Atual (${unidade === 'Metric' ? 'kg' : 'lb'}) *`}
            value={weight}
            onChangeText={(val) => handleFieldChange('weight', val, setWeight)}
            onBlur={() => handleBlur('weight')}
            error={errors.weight}
            touched={touched.weight}
            placeholder="80"
            keyboardType="numeric"
            maxLength={5}
            returnKeyType="next"
            onSubmitEditing={() => targetWeightRef.current?.focus()}
            inputRef={weightRef}
            style={styles.flex1}
          />
          <FormInput
            label={`Peso Alvo (${unidade === 'Metric' ? 'kg' : 'lb'}) *`}
            value={targetWeight}
            onChangeText={(val) => handleFieldChange('targetWeight', val, setTargetWeight)}
            onBlur={() => handleBlur('targetWeight')}
            error={errors.targetWeight}
            touched={touched.targetWeight}
            placeholder="70"
            keyboardType="numeric"
            maxLength={5}
            returnKeyType="done"
            inputRef={targetWeightRef}
            style={styles.flex1}
          />
        </View>

        {/* IMC */}
        <BMICard
          bmi={currentBMI}
          bmiCategory={bmiCategory}
          healthyRange={healthyRange}
          unitSystem={unidade}
        />

        {/* Atividade */}
        <ActivityLevelSelector value={activity} onChange={setActivity} />

        {/* Guardar */}
        <SaveButton onPress={salvarDados} loading={loading} />

        <Text style={styles.note}>* Campos obrigatórios</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loading: { flex: 1, backgroundColor: '#121212', justifyContent: 'center' },
  scroll: { flexGrow: 1, paddingHorizontal: 25, paddingBottom: 50, paddingTop: 10 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  flex1: { flex: 1 },
  note: { color: '#666', fontSize: 11, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
});