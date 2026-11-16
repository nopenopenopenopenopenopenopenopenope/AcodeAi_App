import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';

import { useState } from 'react';

/*
  Um form só para as três áreas da tela de Alimentação. Qual delas abre é
  decidido por initialData.section, que a tela passa em func('diet', {...}):

   - 'goals'        -> metas de calorias e macros (calories, carbs, protein, lipids)
   - 'water'        -> meta de água (water) e água consumida agora (waterAdd), em ml
   - 'restrictions' -> alergias e intolerâncias (allergies, intolerances),
                       separadas por vírgula

  O output sai com todos os campos + section; o App.js (saveDiet) usa só
  os da seção.
*/

const TITLES = {
  goals: 'Metas diárias',
  water: 'Consumo de água',
  restrictions: 'Restrições alimentares',
};

function Field({ label, ...props }) {
  return (
    <View style={styles.item}>
      <Text>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#B3B3B3"
        autoComplete="none"
        {...props}
      />
    </View>
  );
}

export default function DietF({ style, closeForm, useOutput, initialData }) {
  const section = initialData?.section ?? 'goals';

  const [v, setV] = useState({
    calories: String(initialData?.calories ?? ''),
    carbs: String(initialData?.carbs ?? ''),
    protein: String(initialData?.protein ?? ''),
    lipids: String(initialData?.lipids ?? ''),
    water: String(initialData?.water ?? ''),
    waterAdd: '',
    allergies: String(initialData?.allergies ?? ''),
    intolerances: String(initialData?.intolerances ?? ''),
  });
  const set = (key) => (text) => setV((prev) => ({ ...prev, [key]: text }));

  const formOutput = () => {
    useOutput({ section, ...v });
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <Text style={styles.title}>{TITLES[section] ?? TITLES.goals}</Text>

          {section === 'goals' && (
            <>
              <Field
                label="Meta de calorias (kcal)"
                keyboardType="numeric"
                placeholder="Ex: 2000"
                value={v.calories}
                onChangeText={set('calories')}
              />
              <Field
                label="Carboidratos (g)"
                keyboardType="numeric"
                value={v.carbs}
                onChangeText={set('carbs')}
              />
              <Field
                label="Proteínas (g)"
                keyboardType="numeric"
                value={v.protein}
                onChangeText={set('protein')}
              />
              <Field
                label="Lipídios (g)"
                keyboardType="numeric"
                value={v.lipids}
                onChangeText={set('lipids')}
              />
            </>
          )}

          {section === 'water' && (
            <>
              <Field
                label="Meta diária de água (ml)"
                keyboardType="numeric"
                placeholder="Ex: 2000"
                value={v.water}
                onChangeText={set('water')}
              />
              <Field
                label="Água consumida agora (ml)"
                keyboardType="numeric"
                placeholder="Ex: 250 — soma ao total de hoje"
                value={v.waterAdd}
                onChangeText={set('waterAdd')}
              />
            </>
          )}

          {section === 'restrictions' && (
            <>
              <Field
                label="Alergias"
                placeholder="Separadas por vírgula"
                value={v.allergies}
                onChangeText={set('allergies')}
              />
              <Field
                label="Intolerâncias"
                placeholder="Separadas por vírgula"
                value={v.intolerances}
                onChangeText={set('intolerances')}
              />
            </>
          )}

          <View style={styles.item}>
            <TouchableOpacity style={styles.button} onPress={formOutput}>
              <Text style={{ color: '#F5F5F5' }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  button: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  item: {
    gap: 8,
  },
  form: {
    width: '80%',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 8,
  },
});