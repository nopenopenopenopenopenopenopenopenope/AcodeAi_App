import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import DateField, { formatDateBR } from '../components/DateField';

export default function StockF({ style, closeForm, useOutput, initialData }) {
  const [lastAcquisition, setLastAcquisition] = useState(
    initialData?.lastAcquisition ?? formatDateBR(new Date())
  );

  // Lista de produtos individuais: [{ name: '', quantity: '' }]
  const [items, setItems] = useState(initialData?.items ?? [{ name: '', quantity: '' }]);

  const addItemRow = () => {
    setItems((prev) => [...prev, { name: '', quantity: '' }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemRow = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const formOutput = () => {
    useOutput({
      lastAcquisition,
      items,
    });
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <Text style={styles.title}>Adicionar Produtos ao Estoque</Text>

          <View style={styles.item}>
            <Text style={styles.label}>Data de aquisição</Text>
            <DateField
              value={lastAcquisition}
              onChange={setLastAcquisition}
              mode="date"
              placeholder="Escolher data"
            />
          </View>

          <Text style={[styles.label, { marginTop: 4 }]}>Produtos:</Text>

          <ScrollView style={styles.itemListContainer} nestedScrollEnabled={true}>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  placeholder="Nome do produto"
                  placeholderTextColor="#B3B3B3"
                  value={item.name}
                  onChangeText={(val) => updateItemRow(index, 'name', val)}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Qtd"
                  placeholderTextColor="#B3B3B3"
                  keyboardType="numeric"
                  value={item.quantity}
                  onChangeText={(val) => updateItemRow(index, 'quantity', val)}
                />
                {items.length > 1 && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeItemRow(index)}>
                    <Feather name="trash-2" size={18} color="#D64545" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addItemBtn} onPress={addItemRow}>
              <Feather name="plus" size={16} color="#36A06F" />
              <Text style={styles.addItemText}>Adicionar outro produto</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={formOutput}>
            <Text style={styles.buttonText}>Salvar no estoque</Text>
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
    width: '90%',
    maxHeight: '85%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#36A06F', marginBottom: 2 },
  item: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  input: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: 8, padding: 8, fontSize: 14 },
  itemListContainer: {
    maxHeight: 220,
    marginVertical: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#36A06F',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  addItemText: {
    color: '#36A06F',
    fontWeight: '600',
    fontSize: 14,
  },
  button: { backgroundColor: '#36A06F', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#F5F5F5', fontWeight: 'bold', fontSize: 15 },
});