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
//Unfinished

import DateField from '../components/DateField';

export default function LaudoF({ style, closeForm, useOutput, initialData }) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [date, setDate] = useState(initialData?.date ?? '');
  const [doctor, setDoctor] = useState(initialData?.doctor ?? '');
  const [file, setFile] = useState(initialData?.file ?? '');

  const formOutput = () => {
    const output = {
      name: nome,
      date: date,
      doctor: doctor,
      file: file,
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
            <Text>Nome </Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder="Nome do arquivo"
              placeholderTextColor="#B3B3B3"
              value={String(nome)}
              onChangeText={(text) => {
                setNome(text);
              }}
              autoComplete="name"
            />
          </View>

          <View style={styles.item}>
            <Text>Médico</Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#B3B3B3"
              value={String(doctor)}
              onChangeText={(text) => {
                setDoctor(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
            <DateField value={date} onChange={setDate} mode="date" placeholder="Escolher Data" />
          </View>
          <View style={styles.item}>
            <TouchableOpacity style={styles.button}>
              <Text style={{ color: '#F5F5F5' }}>Escolher Arquivo</Text>
            </TouchableOpacity>
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