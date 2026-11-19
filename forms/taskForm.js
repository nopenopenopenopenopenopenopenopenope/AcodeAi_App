import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';

import { useState } from 'react';
import DateField, { formatDateBR } from '../components/DateField';

export default function TaskF({ style, closeForm, useOutput, initialData }) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [desc, setDesc] = useState(initialData?.desc ?? '');
  
  // Data padrão: usa a data existente ou a de hoje formatada em BR (dd/mm/aaaa)
  const [date, setDate] = useState(
    initialData?.date ?? formatDateBR(new Date())
  );
  // Horário padrão: usa o horário existente ou o atual formatado (ex: "14h30")
  const [time, setTime] = useState(initialData?.time ?? '');

  const formOutput = () => {
    const output = {
      name: nome,
      desc: desc,
      date: date,
      time: time,
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
            <Text>Nome da tarefa</Text>
            <TextInput
              keyboardType="default"
              style={styles.input}
              placeholder="Ex: “Remédio: Levedopa” "
              placeholderTextColor="#B3B3B3"
              value={String(nome)}
              onChangeText={(text) => {
                setNome(text);
              }}
              autoComplete="name"
            />
          </View>
          <View style={styles.item}>
            <Text>Descrição rápida</Text>
            <TextInput
              keyboardType="default"
              style={styles.input}
              placeholder="Ex: “Ministrar remédio” "
              placeholderTextColor="#B3B3B3"
              value={String(desc)}
              onChangeText={(text) => {
                setDesc(text);
              }}
              autoComplete="off"
            />
          </View>
          
          {/* Seletor de Data */}
          <View style={styles.item}>
            <Text>Data da tarefa</Text>
            <DateField
              value={date}
              onChange={setDate}
              mode="date"
              placeholder="Escolher a data"
            />
          </View>

          {/* Seletor de Horário */}
          <View style={styles.item}>
            <Text>Horário</Text>
            <DateField
              value={time}
              onChange={setTime}
              mode="time"
              placeholder="Escolher o horário"
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
    padding: 10,
    alignItems: 'center',
  },
  item: {
    gap: 4,
  },
  form: {
    width: '80%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 8,
  },
});