import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { urlDoLaudo, buscarConexoesPaciente } from '../components/storageFuncs';

/**
 * Paciente (patient) object shape driving this whole screen.
 * {
 *   id: string,                   // unique patient id, shown on screen for reference
 *   name: string,                 // "Samantha Silveira"
 *   birthDate: string,            // "dd/mm/aaaa", used to compute the age shown
 *   foto: string | null,          // patient photo (data URI base64)
 *   conditions: string[],         // "Condições:" list, e.g. ["Alzheimer", "Parkinson", "Hipertensão"]
 *   heartRate: {
 *     current: number,            // 96
 *     history: [
 *       { hour: string, bpm: number }, // not shown on this screen anymore (chart removed); see `vitals`
 *       ...
 *     ],
 *   },
 *   vitals: [                     // bpm + blood pressure history, NEWEST FIRST
 *     { id, date: "dd/mm/aaaa", hour: "9:05", bpm: number | null, pressure: string },
 *     ...
 *   ],
 *   bloodType: string,            // "A+"
 *   weight: string,               // "68 kg" (current weight, kept in Pacientes)
 *   weightHistory: [              // weight history, NEWEST FIRST
 *     { id, date: "dd/mm/aaaa", hour: "9:05", value: "68.5 kg" },
 *     ...
 *   ],
 *   laudos: [
 *     {
 *       name: string,               // report file name, from LaudoF's "Nome do arquivo"
 *       date: string,               // "dd/mm/aaaa", exam date, from LaudoF's date picker
 *       doctor: string,             // requesting/reporting doctor's name
 *       file: string,               // uri of the selected report file, from LaudoF's file picker
 *     },
 *     ...
 *   ],
 *   medicines: [
 *     {
 *       name: string,               // medicine name, from MedicineF's "Nome"
 *       start: string,              // "dd/mm/aaaa", date usage started
 *       treatment: string,          // condition being treated, e.g. "Doença de Alzheimer"
 *       frequency: string,          // e.g. "2 vezes ao dia"
 *       foto: string | null,        // uri of the medicine package photo
 *     },
 *     ...
 *   ],
 *   schedule: [
 *     {
 *       name: string,      // task/reminder name, from TaskF's "Nome da tarefa"
 *       desc: string,      // from TaskF's "Descrição rápida"
 *       time: string,      // e.g. "6h30" or "9:30 AM"
 *       date: string,      // "dd/mm/aaaa" — which day this entry belongs to
 *       completed: boolean,// whether it's been checked off
 *       type: 'task' | 'event', // 'task' (default, shown on the calendar) or
 *                                // 'event' (medical appointments etc, shown on home)
 *       // event-only fields (see screens/home.js):
 *       professional: string, // e.g. "Dra. Carla Vespolli"
 *       place: string,         // e.g. "Hospital das Clínicas da UFMG"
 *       address: string,       // e.g. "Av. Prof. Alfredo Balena, 110 - Santa Efigênia"
 *     },
 *     ...
 *   ],
 *   reports: [
 *     {
 *       title: string,   // from ReportF's "Título do relatório"
 *       date: string,    // "dd/mm/aaaa", from ReportF's date picker
 *       body: string,    // from ReportF's "Corpo do relatório"
 *       notes: string,   // from ReportF's "Observações extras", shown as "Observação:" in the list preview
 *     },
 *     ...
 *   ],
 *   checkins: [
 *     {
 *       feeling: string,    // from CheckInF's "Como o paciente está se sentindo hoje?"
 *       sleep: string,      // from CheckInF's "Como foi o sono?"
 *       moodChange: string, // from CheckInF's "Há alteração de humor?"
 *       notes: string,      // from CheckInF's "Observações extras"
 *       date: string,       // "dd/mm/aaaa", always the day the check-in was made (not typed in the form)
 *     },
 *     ...
 *   ],
 *   diet: {
 *     calories: { current: number, goal: number },  // kcal
 *     macros: {
 *       carbs: { current: number, goal: number },    // g
 *       protein: { current: number, goal: number },  // g
 *       lipids: { current: number, goal: number },   // g
 *     },
 *     water: { current: number, goal: number },       // ml
 *     restrictions: {
 *       allergies: string[],
 *       intolerances: string[],
 *     },
 *   },
 * }
 */

const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const [day, month, year] = birthDate.split('/').map(Number);
  if (!day || !month || !year) return null;
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

// PacientF's fields don't line up 1:1 with the paciente shape (its
// "restrictions" is really diet restrictions, not medical conditions),
// so shape the edit payload to match what PacientF's initialData expects.
const toPacientFormData = (paciente) => ({
  id: paciente?.id,
  name: paciente?.name ?? '',
  age: paciente?.birthDate ?? '',
  conditions: paciente?.conditions ?? [],
  restrictions: paciente?.diet?.restrictions?.allergies ?? [],
  bloodType: paciente?.bloodType ?? '',
  foto: paciente?.foto ?? '',
});

export default function Info({ paciente, func, currentUserId, onRemovePacientConnection }) {
  const age = calculateAge(paciente?.birthDate);

  // Hooks precisam vir antes do return condicional abaixo.
  const [showVitals, setShowVitals] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [connections, setConnections] = useState([]);

  const loadConnections = useCallback(async () => {
    if (!paciente?.id) {
      setConnections([]);
      return;
    }
    const list = await buscarConexoesPaciente(paciente.id);
    setConnections(Array.isArray(list) ? list : []);
  }, [paciente?.id]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const isAdmin = Boolean(
    currentUserId &&
      connections.some((c) => c.user_id === currentUserId && c.is_admin)
  );
  const otherConnections = connections.filter((c) => c.user_id !== currentUserId);

  const handleRemoveConnection = async (targetUserId) => {
    if (!onRemovePacientConnection || !paciente?.id) return;
    await onRemovePacientConnection(paciente.id, targetUserId);
    await loadConnections();
  };

  // Mais recente primeiro (ordem já vem do storage).
  const vitals = paciente?.vitals ?? [];
  const weights = paciente?.weightHistory ?? [];
  const latestVital = vitals[0];
  const latestWeight = weights[0];

  const openLaudo = async (file) => {
    const url = await urlDoLaudo(file);
    if (url) Linking.openURL(url);
  };

  if (!paciente) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="user-x" size={48} color="#B3B3B3" />
        <Text style={styles.emptyText}>Nenhum paciente cadastrado</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => func('pacient')}>
          <Text style={styles.emptyButtonText}>Adicionar paciente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Informações Médicas</Text>
        <TouchableOpacity onPress={() => func('pacient', toPacientFormData(paciente))}>
          <Feather name="edit-2" size={18} color="#36A06F" />
        </TouchableOpacity>
      </View>

      <View style={styles.patientRow}>
        {paciente?.foto ? (
          <Image source={{ uri: paciente.foto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Feather name="user" size={36} color="#B3B3B3" />
          </View>
        )}
        <View>
          <Text style={styles.patientName}>{paciente?.name}</Text>
          {age !== null && <Text style={styles.patientAge}>{age} anos</Text>}
          {paciente?.id && <Text style={styles.patientId}>ID: {paciente.id}</Text>}
        </View>
      </View>

      <Text style={styles.conditionsText}>
        <Text style={styles.boldText}>Condições: </Text>
        {paciente?.conditions?.join(', ')}
      </Text>

      <Text style={styles.conditionsText}>
        <Text style={styles.boldText}>Restrições alimentares: </Text>
        {paciente?.diet?.restrictions?.allergies?.join(', ')}
      </Text>

      {/* Ritmo cardíaco + pressão: mostra o registro mais recente; o + abre o histórico */}
      <View style={styles.card}>
        <View style={styles.heartRateRow}>
          <View style={{ flexShrink: 1 }}>
            <View style={styles.labelWithEdit}>
              <Text style={styles.sectionTitle}>Ritmo cardíaco e pressão</Text>
              {vitals.length > 1 && (
                <TouchableOpacity onPress={() => setShowVitals((v) => !v)}>
                  <Feather name={showVitals ? 'minus' : 'plus'} size={16} color="#36A06F" />
                </TouchableOpacity>
              )}
            </View>

            {latestVital ? (
              <>
                <View style={styles.bpmRow}>
                  <Text style={styles.bpmValue}>{latestVital.bpm ?? '—'}</Text>
                  <Text style={styles.bpmUnit}>bpm</Text>
                </View>
                <Text style={styles.vitalPressure}>Pressão: {latestVital.pressure || '—'}</Text>
                <Text style={styles.vitalDate}>
                  {latestVital.date} às {latestVital.hour}
                </Text>
              </>
            ) : (
              <Text style={styles.emptySectionText}>
                Nenhum registro de ritmo cardíaco ou pressão sanguínea
              </Text>
            )}
          </View>
        </View>

        {showVitals && vitals.length > 1 && (
          <View style={styles.historyList}>
            {vitals.map((v) => (
              <View key={v.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {v.date} · {v.hour}
                </Text>
                <Text style={styles.historyValue}>
                  {v.bpm != null ? `${v.bpm} bpm` : '—'}  ·  {v.pressure || '—'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.card, styles.statsCard]}>
        <View style={styles.statColumn}>
          <View style={styles.labelWithEdit}>
            <Text style={styles.sectionTitle}>Tipo sanguíneo</Text>
          </View>
          <Text style={styles.statValue}>{paciente?.bloodType}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statColumn}>
          <View style={styles.labelWithEdit}>
            <Text style={styles.sectionTitle}>Peso</Text>
            {weights.length > 1 && (
              <TouchableOpacity onPress={() => setShowWeights((v) => !v)}>
                <Feather name={showWeights ? 'minus' : 'plus'} size={16} color="#36A06F" />
              </TouchableOpacity>
            )}
          </View>
          {latestWeight ? (
            <>
              <Text style={styles.statValue}>{latestWeight.value}</Text>
              <Text style={styles.vitalDate}>{latestWeight.date}</Text>
            </>
          ) : (
            <Text style={[styles.emptySectionText, { textAlign: 'center' }]}>
              Nenhum peso registrado
            </Text>
          )}
        </View>
      </View>

      {showWeights && weights.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Histórico de peso</Text>
          {weights.map((w) => (
            <View key={w.id} style={styles.historyRow}>
              <Text style={styles.historyDate}>
                {w.date} · {w.hour}
              </Text>
              <Text style={styles.historyValue}>{w.value}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Laudos</Text>
        {paciente?.laudos?.length ? (
          paciente.laudos.map((laudo, index) => (
            <View key={index} style={styles.laudoRow}>
              <View style={styles.laudoInfo}>
                <Feather name="file-text" size={18} color="#333333" />
                <View>
                  <Text style={styles.laudoTitle}>{laudo.name}</Text>
                  <Text style={styles.laudoDate}>
                    {laudo.doctor}
                    {laudo.doctor && laudo.date ? ' · ' : ''}
                    {laudo.date}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => openLaudo(laudo.file)}>
                <Text style={styles.contactAction}>Abrir</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptySectionText}>Nenhum laudo cadastrado</Text>
        )}
        <TouchableOpacity style={styles.addLaudoButton} onPress={() => func('laudo')}>
          <Text style={styles.addLaudoButtonText}>Adicionar laudo</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Usuários conectados</Text>
          {otherConnections.length ? (
            otherConnections.map((user) => (
              <View key={user.user_id} style={styles.laudoRow}>
                <View style={styles.laudoInfo}>
                  <Feather name="user" size={18} color="#333333" />
                  <View>
                    <Text style={styles.laudoTitle}>{user.name || user.email}</Text>
                    {user.email && user.name && (
                      <Text style={styles.laudoDate}>{user.email}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveConnection(user.user_id)}>
                  <Text style={styles.removeConnectionText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptySectionText}>
              Nenhum outro usuário conectado a este paciente
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#4D4D4D',
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  patientAge: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  patientId: {
    fontSize: 12,
    color: '#B3B3B3',
    marginTop: 2,
  },
  conditionsText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  labelWithEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactAction: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  removeConnectionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C62828',
  },
  heartRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  bpmValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  bpmUnit: {
    fontSize: 15,
    color: '#4D4D4D',
    marginBottom: 5,
  },
  vitalPressure: {
    fontSize: 15,
    color: '#1A1A1A',
    marginTop: 2,
  },
  vitalDate: {
    fontSize: 12,
    color: '#808080',
    marginTop: 2,
  },
  historyList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  historyDate: {
    fontSize: 13,
    color: '#808080',
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statsCard: {
    flexDirection: 'row',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  laudoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  laudoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  laudoTitle: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  laudoDate: {
    fontSize: 12,
    color: '#808080',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#808080',
  },
  addLaudoButton: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addLaudoButtonText: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
});