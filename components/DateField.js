import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const pad = (n) => String(n).padStart(2, '0');

export const formatDateBR = (date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export const formatTimeBR = (date) =>
  `${pad(date.getHours())}h${pad(date.getMinutes())}`;

export const parseDateBR = (str) => {
  const [day, month, year] = String(str ?? '').split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

/*
  Botão que abre o seletor de data/hora nativo do dispositivo e guarda o
  valor escolhido já formatado (dd/mm/aaaa para mode="date", "Hh MM" para
  mode="time"). Só chama onChange quando o usuário efetivamente confirma
  uma escolha — cancelar deixa o valor (e o formOutput) como estavam, para
  que o form possa cair no valor de hoje/agora só se o usuário não
  escolher nada.
*/
export default function DateField({ value, onChange, mode = 'date', placeholder }) {
  const [showPicker, setShowPicker] = useState(false);

  const currentValue =
    mode === 'date' ? parseDateBR(value) ?? new Date() : new Date();

  const handleChange = (event, selected) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && selected) {
      onChange(mode === 'date' ? formatDateBR(selected) : formatTimeBR(selected));
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{value ? value : placeholder}</Text>
      </TouchableOpacity>
      {showPicker && (
        <>
          <DateTimePicker
            value={currentValue}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.confirmButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#1F6B45',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#F5F5F5',
  },
});