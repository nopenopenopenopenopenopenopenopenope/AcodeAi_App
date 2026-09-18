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
import DateField from '../components/DateField';

export default function TaskF({ style, closeForm, useOutput, initialData }) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [desc, setDesc] = useState(initialData?.desc ?? '');
  const [time, setTime] = useState(initialData?.time ?? '');
  const formOutput = () => {
    const output = {
      name: nome,
      desc: desc,
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
              keyboardType="text"
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
              keyboardType="text"
              style={styles.input}
              placeholder="Ex: “Ministrar remédio” "
              placeholderTextColor="#B3B3B3"
              value={String(desc)}
              onChangeText={(text) => {
                setDesc(text);
              }}
              autoComplete="none"
            />
          </View>
          <View style={styles.item}>
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