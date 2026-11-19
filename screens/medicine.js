import { useState,useEffect  } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { marcarDoseMedicamento } from '../components/storageFuncs';
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

const getTodayKey = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function Medicine({ paciente, func, onRemove }) {
  const medicines = paciente?.medicines ?? [];
const todayKey = getTodayKey();

const [takenDoses, setTakenDoses] = useState({});

// Recupera os registros salvos no Supabase
useEffect(() => {
  const loaded = {};

  medicines.forEach(medicine => {
    const medId = medicine.id;

    (medicine.doseHistory ?? []).forEach(dose => {
      if (dose.date === todayKey) {
        const key = `${medId}-${dose.time}-${todayKey}`;
        loaded[key] = true;
      }
    });
  });

  setTakenDoses(loaded);
}, [paciente?.medicines, todayKey]);

// Atualiza o banco e a interface
const toggleDose = async (medId, time) => {
  if (!medId) return;

  const key = `${medId}-${time}-${todayKey}`;
  const nextValue = !takenDoses[key];

  const success = await marcarDoseMedicamento(
    medId,
    todayKey,
    time,
    nextValue
  );

  if (!success) return;

  setTakenDoses(prev => ({
    ...prev,
    [key]: nextValue,
  }));
};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {paciente && (
        <View style={styles.headerRow}>
          <Text style={styles.title}>Remédios receitados</Text>
          <TouchableOpacity onPress={() => func('medicine')}>
            <Feather name="plus" size={24} color="#36A06F" />
          </TouchableOpacity>
        </View>
      )}

      {medicines.length === 0 ? (
        !paciente ? (
          <Text style={styles.emptyText}>Nenhum paciente selecionado</Text>
        ) : (
          <Text style={styles.emptyText}>Nenhum remédio cadastrado</Text>
        )
      ) : (
        medicines.map((medicine, index) => {
          const medId = medicine.id ?? index;
          // Se tiver array de times usa ele, senão converte o frequency em lista ou exibe string única
          const timesList = Array.isArray(medicine.times) && medicine.times.length > 0
            ? medicine.times
            : [medicine.frequency];

          return (
            <View key={medId} style={styles.card}>
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
                <Text style={styles.medicineLine}>
                  Em uso: <Text style={styles.boldText}>{formatUsageDuration(medicine.start)}</Text>
                </Text>

                {/* Lista de horários com botões de check individuais */}
                <View style={styles.dosesContainer}>
                  <Text style={styles.dosesTitle}>Horários de hoje:</Text>
                  <View style={styles.dosesRow}>
                    {timesList.map((time, tIndex) => {
                      const doseKey = `${medId}-${time}-${todayKey}`;
                      const isTaken = !!takenDoses[doseKey];

                      return (
                        <TouchableOpacity
                          key={tIndex}
                          style={[styles.dosePill, isTaken && styles.dosePillTaken]}
                          onPress={() => toggleDose(medId, time)}
                        >
                          <Feather
                            name={isTaken ? "check-circle" : "circle"}
                            size={14}
                            color={isTaken ? "#F5F5F5" : "#36A06F"}
                          />
                          <Text style={[styles.doseText, isTaken && styles.doseTextTaken]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => func('medicine', medicine)}>
                  <Feather name="edit-2" size={18} color="#36A06F" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onRemove?.(medicine.id)}>
                  <Feather name="trash-2" size={18} color="#D64545" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
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
  cardActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
    gap: 4,
  },
  medicineName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  medicineLine: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  boldText: {
    fontWeight: 'bold',
  },
  dosesContainer: {
    marginTop: 6,
    gap: 4,
  },
  dosesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  dosesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dosePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F5EC',
    borderWidth: 1,
    borderColor: '#36A06F',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  dosePillTaken: {
    backgroundColor: '#36A06F',
  },
  doseText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  doseTextTaken: {
    color: '#F5F5F5',
  },
});