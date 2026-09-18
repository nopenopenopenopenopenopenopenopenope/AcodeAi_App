import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
  Reads paciente.medicines — an array of entries with the exact shape
  MedicineF's formOutput() produces:
  {
    name: string,        // medicine name
    start: string,       // "dd/mm/aaaa", date usage started
    treatment: string,   // condition being treated, e.g. "Doença de Alzheimer"
    frequency: string,   // e.g. "2 vezes ao dia"
    foto: string | null, // uri of the medicine package photo
  }
 */

const MASCULINE_NUMBER_WORDS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const FEMININE_NUMBER_WORDS = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

const formatUnit = (count, singular, plural, masculine) => {
  const words = masculine ? MASCULINE_NUMBER_WORDS : FEMININE_NUMBER_WORDS;
  const word = count <= 10 ? words[count] : String(count);
  const unit = count === 1 ? singular : plural;
  return `há ${word} ${unit}`;
};

const formatUsageDuration = (startDate) => {
  if (!startDate) return '';
  const [day, month, year] = startDate.split('/').map(Number);
  if (!day || !month || !year) return '';

  const start = new Date(year, month - 1, day);
  const today = new Date();
  const diffDays = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));

  if (diffDays < 7) {
    return formatUnit(diffDays, 'dia', 'dias', true);
  }
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return formatUnit(diffWeeks, 'semana', 'semanas', false);
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return formatUnit(diffMonths, 'mês', 'meses', true);
  }
  const diffYears = Math.floor(diffMonths / 12);
  return formatUnit(diffYears, 'ano', 'anos', true);
};

export default function Medicine({ paciente, func }) {
  const medicines = paciente?.medicines ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Remédios receitados</Text>
        <TouchableOpacity onPress={() => func('medicine')}>
          <Feather name="plus" size={24} color="#36A06F" />
        </TouchableOpacity>
      </View>

      {medicines.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum remédio cadastrado</Text>
      ) : (
        medicines.map((medicine, index) => (
          <View key={index} style={styles.card}>
            {medicine.foto ? (
              <Image source={{ uri: medicine.foto }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Feather name="package" size={28} color="#B3B3B3" />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <Text style={styles.medicineLine}>Tratamento: {medicine.treatment}</Text>
              <Text style={styles.medicineLine}>Frequência: {medicine.frequency}</Text>
              <Text style={styles.medicineLine}>
                Em uso: <Text style={styles.boldText}>{formatUsageDuration(medicine.start)}</Text>
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const THUMB_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  emptyText: {
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
    marginTop: 24,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  medicineName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#36A06F',
    marginBottom: 2,
  },
  medicineLine: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  boldText: {
    fontWeight: 'bold',
  },
});