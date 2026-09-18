import { StyleSheet, Text, View, ScrollView } from 'react-native';

/*
  Reads paciente.schedule (see screens/info.js for the full shape) and
  shows the upcoming entries with type "event" (e.g. medical appointments,
  exams) — as opposed to type "task" (routine reminders like medication,
  which live on the calendar screen instead).

  Extra fields an "event" entry can carry, on top of the base schedule
  shape ({ name, desc, time, date, completed }):
  {
    type: 'event',
    professional: string, // e.g. "Dra. Carla Vespolli"
    place: string,        // e.g. "Hospital das Clínicas da UFMG"
    address: string,      // e.g. "Av. Prof. Alfredo Balena, 110 - Santa Efigênia"
  }
*/

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const parseDate = (dateStr) => {
  const [day, month, year] = String(dateStr ?? '').split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const timeToMinutes = (time) => {
  if (!time) return Number.MAX_SAFE_INTEGER;
  const ampm = String(time).match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampm) {
    let hours = Number(ampm[1]) % 12;
    if (/PM/i.test(ampm[3])) hours += 12;
    return hours * 60 + Number(ampm[2]);
  }
  const hm = String(time).match(/(\d+)[h:](\d+)/);
  if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  return Number.MAX_SAFE_INTEGER;
};

const getUpcomingEvents = (schedule) => {
  const today = startOfDay(new Date());
  return (schedule ?? [])
    .filter((item) => item.type === 'event')
    .map((item) => ({ ...item, _date: parseDate(item.date) }))
    .filter((item) => item._date && item._date >= today)
    .sort((a, b) => a._date - b._date || timeToMinutes(a.time) - timeToMinutes(b.time));
};

function EventCard({ event }) {
  const date = event._date;
  const weekday = date ? WEEKDAY_NAMES[date.getDay()] : '';
  const dayMonth = date
    ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.dateBox}>
        <Text style={styles.dateWeekday}>{weekday}</Text>
        <Text style={styles.dateDay}>{dayMonth}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.eventName}>{event.name}</Text>
        <View style={styles.eventTimeRow}>
          <Text style={styles.eventTime}>{event.time}</Text>
          {!!event.professional && (
            <Text style={styles.eventProfessional}>{event.professional}</Text>
          )}
        </View>
        {!!event.place && <Text style={styles.eventPlace}>{event.place}</Text>}
        {!!event.address && <Text style={styles.eventAddress}>{event.address}</Text>}
      </View>
    </View>
  );
}

export default function Home({ paciente, func }) {
  const events = getUpcomingEvents(paciente?.schedule);
  const nextEvent = events[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Próximo Evento!</Text>
      {nextEvent ? (
        <EventCard event={nextEvent} />
      ) : (
        <Text style={styles.emptyText}>Nenhum evento agendado</Text>
      )}

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Outros eventos</Text>
      {events.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum outro evento agendado</Text>
      ) : (
        events.map((event, index) => <EventCard key={index} event={event} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#36A06F',
    marginBottom: 12,
  },
  sectionTitleSpaced: {
    marginTop: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#808080',
    marginBottom: 16,
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
  dateBox: {
    minWidth: 76,
    backgroundColor: '#EDEDED',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  dateWeekday: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  eventTimeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  eventProfessional: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  eventPlace: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  eventAddress: {
    fontSize: 11,
    color: '#808080',
  },
});