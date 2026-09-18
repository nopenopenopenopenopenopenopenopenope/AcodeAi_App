import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated } from 'react-native';

import { useState } from 'react';
//Unfinished

import DateField from '../components/DateField';

export default function ReportF({ style, closeForm, useOutput, initialData }) {
  const [titulo, setTitulo] = useState(initialData?.title ?? '');
  const [data, setData] = useState(initialData?.date ?? '');
  const [corpo, setCorpo] = useState(initialData?.body ?? '');
  const [observacoes, setObservacoes] = useState(initialData?.notes ?? '');

  const formOutput = () => {
    const output = {
      title: titulo,
      date: data,
      body: corpo,
      notes: observacoes,
    };

    useOutput(output);
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <View style={styles.item}>
            <Text>Título do relatório</Text>
            <TextInput
              keyboardType="default"
              style={styles.input}
              placeholder="Título do relatório"
              placeholderTextColor="#B3B3B3"
              value={String(titulo)}
              onChangeText={(text) => {
                setTitulo(text);
              }}
              autoComplete="none"
            />
          </View>

          <View style={styles.item}>
            <Text>Data do relatório</Text>
            <DateField value={data} onChange={setData} mode="date" placeholder="dd/mm/aaaa" />
          </View>

          <View style={styles.item}>
            <Text>Corpo do relatório</Text>
            <TextInput
              keyboardType="default"
              style={[styles.input, styles.textarea]}
              placeholder=""
              placeholderTextColor="#B3B3B3"
              value={String(corpo)}
              onChangeText={(text) => {
                setCorpo(text);
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoComplete="none"
            />
          </View>

          <View style={styles.item}>
            <Text>Observações extras</Text>
            <TextInput
              keyboardType="default"
              style={styles.input}
              placeholderTextColor="#B3B3B3"
              value={String(observacoes)}
              onChangeText={(text) => {
                setObservacoes(text);
              }}
              autoComplete="none"
            />
          </View>

          <View style={styles.item}>
            <TouchableOpacity style={styles.button} onPress={formOutput}>
              <Text style={{ color: '#F5F5F5' }}>Enviar relatório</Text>
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
    marginBottom: 8,
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
  textarea: {
    minHeight: 120,
  },
});