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
  Same pattern as ConnectStockF: `useOutput` returns a result
  synchronously ({ success, error }) instead of always closing — a
  caregiver can be connected to several patients (up to
  profile.pacientsLimit), but each code has to match an existing patient,
  so this stays open and shows the error on failure instead of closing.
*/
export default function ConnectPacientF({ style, closeForm, useOutput, initialData }) {
  const [codigo, setCodigo] = useState(initialData?.pacientId ?? '');
  const [erro, setErro] = useState('');

  const formOutput = () => {
    const output = {
      pacientId: codigo,
    };

    const result = useOutput(output);
    if (result?.success) {
      setErro('');
      closeForm();
    } else {
      setErro(result?.error ?? 'Não foi possível conectar');
    }
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <View style={styles.item}>
            <Text>Código do paciente</Text>
            <TextInput
              keyboardType="default"
              autoCapitalize="none"
              style={styles.input}
              placeholder="Ex: pacient_abc123"
              placeholderTextColor="#B3B3B3"
              value={String(codigo)}
              onChangeText={(text) => {
                setCodigo(text);
              }}
              autoComplete="none"
            />
          </View>

          {!!erro && <Text style={styles.errorText}>{erro}</Text>}

          <View style={styles.item}>
            <TouchableOpacity style={styles.button} onPress={formOutput}>
              <Text style={{ color: '#F5F5F5' }}>Conectar</Text>
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
  errorText: {
    color: '#B34747',
    fontSize: 13,
  },
});