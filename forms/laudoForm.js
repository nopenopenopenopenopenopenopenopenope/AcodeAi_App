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
import * as DocumentPicker from 'expo-document-picker';

import DateField from '../components/DateField';

export default function LaudoF({ style, closeForm, useOutput, initialData }) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [date, setDate] = useState(initialData?.date ?? '');
  const [doctor, setDoctor] = useState(initialData?.doctor ?? '');
  const [file, setFile] = useState(initialData?.file ?? '');
  const [fileName, setFileName] = useState('');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    setFile(asset.uri);
    setFileName(asset.name ?? '');
  };

  // A validação (nome, médico, data e arquivo obrigatórios) fica no storage:
  // se faltar algo, ele mostra o aviso e o formulário continua aberto.
  const formOutput = () => {
    useOutput({
      name: nome,
      date: date,
      doctor: doctor,
      file: file,
    });
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
              <Text>Nome *</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Nome do arquivo"
                placeholderTextColor="#B3B3B3"
                value={nome}
                onChangeText={setNome}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Médico *</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#B3B3B3"
                value={doctor}
                onChangeText={setDoctor}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <DateField
                value={date}
                onChange={setDate}
                mode="date"
                placeholder="Escolher Data *"
              />
            </View>

            <View style={styles.item}>
              <TouchableOpacity style={styles.button} onPress={pickFile}>
                <Text style={{ color: '#F5F5F5' }}>
                  {file ? 'Trocar Arquivo' : 'Escolher Arquivo *'}
                </Text>
              </TouchableOpacity>
              {!!file && (
                <Text style={styles.fileName} numberOfLines={1}>
                  {fileName || 'Arquivo selecionado'}
                </Text>
              )}
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
  fileName: {
    fontSize: 12,
    color: '#808080',
    textAlign: 'center',
  },
});