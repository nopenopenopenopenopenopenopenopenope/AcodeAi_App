import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useState } from 'react';
import DateField from '../components/DateField';

export default function EditStockF({ style, closeForm, useOutput, initialData }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [quantity, setQuantity] = useState(String(initialData?.quantity ?? '0'));
  const [lastAcquisition, setLastAcquisition] = useState(initialData?.lastAcquisition ?? '');

  const formOutput = () => {
    useOutput({
      id: initialData?.id,
      name,
      quantity,
      lastAcquisition,
      foto: initialData?.foto ?? null,
    });
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <Text style={styles.title}>Editar Produto</Text>

          <View style={styles.item}>
            <Text>Nome do produto</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.item}>
            <Text>Quantidade em estoque</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>

          <View style={styles.item}>
            <Text>Última aquisição</Text>
            <DateField
              value={lastAcquisition}
              onChange={setLastAcquisition}
              mode="date"
              placeholder="Escolher data"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={formOutput}>
            <Text style={styles.buttonText}>Salvar alterações</Text>
          </TouchableOpacity>
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
  form: {
    width: '85%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#36A06F', marginBottom: 4 },
  item: { gap: 4 },
  input: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: 8, padding: 8 },
  button: { backgroundColor: '#36A06F', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#F5F5F5', fontWeight: 'bold' },
});