import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DateField, { parseDateBR, formatDateBR } from './DateField';

export default function WeekSelector({ selectedDate, onChangeWeek }) {
  // Converte a data selecionada (string "dd/mm/aaaa") para objeto Date
  const currentDate = parseDateBR(selectedDate) || new Date();

  // Função para avançar ou recuar dias
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Ir para a semana anterior (-7 dias)
  const handlePrevWeek = () => {
    const newDate = addDays(currentDate, -7);
    onChangeWeek(formatDateBR(newDate));
  };

  // Ir para a próxima semana (+7 dias)
  const handleNextWeek = () => {
    const newDate = addDays(currentDate, 7);
    onChangeWeek(formatDateBR(newDate));
  };

  // Quando o usuário escolhe um dia específico pelo calendário nativo
  const handleDateSelected = (formattedDate) => {
    onChangeWeek(formattedDate);
  };

  // Calcula o início (segunda-feira) e fim (domingo) da semana atual da data selecionada
  const getWeekRange = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(d.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${formatDateBR(monday)} - ${formatDateBR(sunday)}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {/* Botão Semana Anterior */}
        <TouchableOpacity style={styles.arrowButton} onPress={handlePrevWeek}>
          <Text style={styles.arrowText}>◀</Text>
        </TouchableOpacity>

        {/* Seletor de Data que exibe o intervalo da semana */}
        <DateField
          value={selectedDate}
          onChange={handleDateSelected}
          mode="date"
          placeholder="Selecionar dia"
        />

        {/* Botão Próxima Semana */}
        <TouchableOpacity style={styles.arrowButton} onPress={handleNextWeek}>
          <Text style={styles.arrowText}>▶</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.rangeText}>
        Semana: {getWeekRange(currentDate)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowButton: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
  },
  rangeText: {
    marginTop: 6,
    color: '#666666',
    fontSize: 12,
  },
});