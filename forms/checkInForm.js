import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';

import { useState } from 'react';
import DateField from '../components/DateField';

export default function CheckInF({ style, closeForm, useOutput, initialData }) {
  const [feeling, setFeeling] = useState(initialData?.feeling ?? '');
  const [sleep, setSleep] = useState(initialData?.sleep ?? '');
  const [moodChange, setMoodChange] = useState(initialData?.moodChange ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [date, setDate] = useState(initialData?.date ?? '');

  const formOutput = () => {
    const output = {
      feeling: feeling,
      sleep: sleep,
      moodChange: moodChange,
      notes: notes,
      date: date,
    };

    useOutput(output);
  };
  return (
    <Animated.View
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <View style={styles.item}>
            <Text>Como o paciente está se sentindo hoje? </Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder="Sentimento principal, queixas"
              placeholderTextColor="#B3B3B3"
              value={String(feeling)}
              onChangeText={(text) => {
                setFeeling(text);
              }}
              autoComplete="name"
            />
          </View>

          <View style={styles.item}>
            <Text>Como foi o sono?</Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder="Boa qualidade, má qualidade"
              placeholderTextColor="#B3B3B3"
              value={String(sleep)}
              onChangeText={(text) => {
                setSleep(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
            <Text>Há alteração de humor?</Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder="Se sim, qual?"
              placeholderTextColor="#B3B3B3"
              value={String(moodChange)}
              onChangeText={(text) => {
                setMoodChange(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
            <Text>Observações extras</Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder=""
              placeholderTextColor="#B3B3B3"
              value={String(notes)}
              onChangeText={(text) => {
                setNotes(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
            <DateField
              value={date}
              onChange={setDate}
              mode="date"
              placeholder="Escolher Data do Check-In"
            />
          </View>
          <View style={styles.item}>
            <TouchableOpacity style={styles.button} onPress={formOutput}>
              <Text style={{ color: '#F5F5F5' }}>Registrar</Text>
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