import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';

import { useState } from 'react';

export default function CheckInF({ style, closeForm, useOutput, initialData }) {
  const [feeling, setFeeling] = useState(initialData?.feeling ?? '');
  const [sleep, setSleep] = useState(initialData?.sleep ?? '');
  const [moodChange, setMoodChange] = useState(initialData?.moodChange ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');

  const formOutput = () => {
    useOutput({ feeling, sleep, moodChange, notes, bloodPressure, heartRate, weight });
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.item}>
              <Text>Como o paciente está se sentindo hoje?</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Sentimento principal, queixas"
                placeholderTextColor="#B3B3B3"
                value={feeling}
                onChangeText={setFeeling}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Como foi o sono?</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Boa qualidade, má qualidade"
                placeholderTextColor="#B3B3B3"
                value={sleep}
                onChangeText={setSleep}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Há alteração de humor?</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Se sim, qual?"
                placeholderTextColor="#B3B3B3"
                value={moodChange}
                onChangeText={setMoodChange}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Pressão sanguínea</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                style={styles.input}
                placeholder="Ex.: 120/80"
                placeholderTextColor="#B3B3B3"
                value={bloodPressure}
                onChangeText={setBloodPressure}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Ritmo cardíaco (bpm, número inteiro)</Text>
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="Ex.: 72"
                placeholderTextColor="#B3B3B3"
                value={heartRate}
                onChangeText={setHeartRate}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Peso (kg)</Text>
              <TextInput
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="Ex.: 68,5"
                placeholderTextColor="#B3B3B3"
                value={weight}
                onChangeText={setWeight}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Observações extras</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder=""
                placeholderTextColor="#B3B3B3"
                value={notes}
                onChangeText={setNotes}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <TouchableOpacity style={styles.button} onPress={formOutput}>
                <Text style={{ color: '#F5F5F5' }}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  scroll: {
    padding: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 8,
  },
});