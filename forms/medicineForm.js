import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, ScrollView } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import DateField, { formatDateBR } from '../components/DateField';

export default function MedicineF({ style, closeForm, useOutput, initialData }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [start, setStart] = useState(initialData?.start ?? formatDateBR(new Date()));
  const [treatment, setTreatment] = useState(initialData?.treatment ?? '');
  const [foto, setFoto] = useState(initialData?.foto ?? null);

  // Lista de horários: ['08:00', '20:00'] ou a frequência antiga caso venha em texto
  const initialTimes = Array.isArray(initialData?.times)
    ? initialData.times
    : initialData?.frequency
    ? [initialData.frequency]
    : [''];

  const [times, setTimes] = useState(initialTimes);

  const addTimeRow = () => setTimes((prev) => [...prev, '']);
  const removeTimeRow = (index) => setTimes((prev) => prev.filter((_, i) => i !== index));
  const updateTimeRow = (index, value) => {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const formOutput = () => {
    const validTimes = times.filter((t) => String(t).trim() !== '');
    useOutput({
      name,
      start,
      treatment,
      times: validTimes, // Salva o array de horários
      frequency: validTimes.join(', '), // Mantém compatibilidade resumida em texto
      foto,
    });
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Receita / Remédio</Text>

            <View style={styles.item}>
              <Text>Nome do remédio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Levodopa"
                placeholderTextColor="#B3B3B3"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.item}>
              <Text>Para qual tratamento?</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Doença de Parkinson"
                placeholderTextColor="#B3B3B3"
                value={treatment}
                onChangeText={setTreatment}
              />
            </View>

            <View style={styles.item}>
              <Text>Início do tratamento</Text>
              <DateField
                value={start}
                onChange={setStart}
                mode="date"
                placeholder="Escolher data"
              />
            </View>

            <View style={styles.item}>
              <Text style={styles.label}>Horários das doses:</Text>
              {times.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Ex: 08:00"
                    placeholderTextColor="#B3B3B3"
                    value={time}
                    onChangeText={(val) => updateTimeRow(index, val)}
                  />
                  {times.length > 1 && (
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeTimeRow(index)}>
                      <Feather name="trash-2" size={18} color="#D64545" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addTimeBtn} onPress={addTimeRow}>
                <Feather name="plus" size={16} color="#36A06F" />
                <Text style={styles.addTimeText}>Adicionar outro horário</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={formOutput}>
              <Text style={styles.buttonText}>Salvar Remédio</Text>
            </TouchableOpacity>
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
  form: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#36A06F', marginBottom: 2 },
  item: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  input: { borderWidth: 1, borderColor: '#d9d9d9', borderRadius: 8, padding: 8, fontSize: 14 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  removeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#36A06F',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 2,
  },
  addTimeText: {
    color: '#36A06F',
    fontWeight: '600',
    fontSize: 14,
  },
  button: { backgroundColor: '#36A06F', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#F5F5F5', fontWeight: 'bold', fontSize: 15 },
});