import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';

import { useState } from 'react';

export default function WeightF({ style, closeForm, useOutput, initialData }) {
  const [peso, setPeso] = useState(initialData?.weight ?? '');

  const formOutput = () => {
    const output = {
      weight: peso,
    };

    useOutput(output);
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <View style={styles.item}>
            <Text>Peso</Text>
            <TextInput
              keyboardType="default"
              style={styles.input}
              placeholder="Ex: “68 kg” "
              placeholderTextColor="#B3B3B3"
              value={String(peso)}
              onChangeText={(text) => {
                setPeso(text);
              }}
              autoComplete="none"
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