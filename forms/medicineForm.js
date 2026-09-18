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

import { medicinePlaceholderImg } from '../components/storageFuncs';
import { pickImageFromLibrary } from '../components/imagePicker';
import DateField from '../components/DateField';

export default function MedicineF({ style, closeForm, useOutput, initialData }) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [startDate, setStartDate] = useState(initialData?.start ?? '');
  const [treatment, setTreatment] = useState(initialData?.treatment ?? '');
  const [frequency, setFrequency] = useState(initialData?.frequency ?? '');
  const [foto, setFoto] = useState(initialData?.foto ?? '');

  const pickPhoto = async () => {
    const uri = await pickImageFromLibrary();
    if (uri) setFoto(uri);
  };

  const formOutput = () => {
    const output = {
      name: nome,
      start: startDate,
      treatment: treatment,
      frequency: frequency,
      foto: foto || null,
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
              placeholder="Nome"
              placeholderTextColor="#B3B3B3"
              value={String(nome)}
              onChangeText={(text) => {
                setNome(text);
              }}
              autoComplete="name"
            />
          </View>

          <View style={styles.item}>
            <Text>Tratamento</Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder='Ex: "Parkinson" '
              placeholderTextColor="#B3B3B3"
              value={String(treatment)}
              onChangeText={(text) => {
                setTreatment(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
            <Text>Frequencia</Text>
            <TextInput
              keyboardType="text"
              style={styles.input}
              placeholder="Ex: “Duas vezes ao dia” "
              placeholderTextColor="#B3B3B3"
              value={String(frequency)}
              onChangeText={(text) => {
                setFrequency(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
            <DateField
              value={startDate}
              onChange={setStartDate}
              mode="date"
              placeholder="Escolher Data Inicial de uso"
            />
          </View>
          <View style={styles.item}>
            <TouchableOpacity style={styles.button} onPress={pickPhoto}>
              <Text style={{ color: '#F5F5F5' }}>
                {foto ? 'Imagem selecionada' : 'Escolher Imagem da Medicação'}
              </Text>
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