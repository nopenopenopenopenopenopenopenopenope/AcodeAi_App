import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
  Reads paciente.schedule — an array of entries built on top of TaskF's
  formOutput() shape ({ name, desc, time }), plus a couple of fields the
  calendar itself needs and that TaskF doesn't collect yet:
  {
    name: string,        // task/reminder name, from TaskF's "Nome da tarefa"
    desc: string,         // from TaskF's "Descrição rápida"
    time: string,          // e.g. "6h30"
    date: string,         // "dd/mm/aaaa" — which day this entry belongs to
    completed: boolean,   // whether it's been checked off
  }
*/

const WEEKDAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getWeekDates = (date) => {
  const day = date.getDay(); // 0 (dom) .. 6 (sáb)
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const formatDateKey = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const formatHeaderDate = (date) =>
  `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}, ${date.getFullYear()}`;

const timeToMinutes = (time) => {
  const match = String(time ?? '').match(/(\d+)[h:](\d+)/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
};

export default function Calendar({ paciente, func }) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [localCompleted, setLocalCompleted] = useState({});

  const schedule = paciente?.schedule ?? [];
  const weekDates = getWeekDates(selectedDate);
  const selectedKey = formatDateKey(selectedDate);

  const tasks = schedule
    .filter((task) => task.date === selectedKey && task.type !== 'event')
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const isTaskChecked = (task, index) => {
    const overrideKey = `${selectedKey}-${index}`;
    return localCompleted[overrideKey] ?? Boolean(task.completed);
  };

  const toggleTask = (task, index) => {
    const overrideKey = `${selectedKey}-${index}`;
    setLocalCompleted((prev) => ({
      ...prev,
      [overrideKey]: !isTaskChecked(task, index),
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.headerDate}>{formatHeaderDate(selectedDate)}</Text>
        <TouchableOpacity onPress={() => func?.('task')}>
          <Feather name="plus" size={26} color="#36A06F" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setSelectedDate(today)}>
        <Text style={styles.todayLink}>Hoje</Text>
      </TouchableOpacity>

      <View style={styles.weekCard}>
        <Text style={styles.weekTitle}>Semana atual</Text>
        <View style={styles.weekRow}>
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayPill, isSelected && styles.dayPillSelected]}
                onPress={() => setSelectedDate(startOfDay(date))}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                  {WEEKDAY_LABELS[date.getDay()]}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!paciente ? (
        <Text style={styles.emptyText}>Nenhum paciente selecionado</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum compromisso agendado para este dia</Text>
      ) : (
        <View style={styles.timeline}>
          {tasks.map((task, index) => {
            const checked = isTaskChecked(task, index);
            return (
              <View key={index} style={styles.taskRow}>
                <View style={styles.checkboxColumn}>
                  <TouchableOpacity
                    style={[styles.checkbox, checked && styles.checkboxChecked]}
                    onPress={() => toggleTask(task, index)}
                  >
                    {checked && <Feather name="check" size={14} color="#F5F5F5" />}
                  </TouchableOpacity>
                  {index < tasks.length - 1 && <View style={styles.connectorLine} />}
                </View>

                <View style={[styles.taskCard, checked && styles.taskCardChecked]}>
                  <View style={styles.taskCardText}>
                    <Text style={[styles.taskName, checked && styles.taskNameChecked]}>
                      {task.name}
                    </Text>
                    <Text style={[styles.taskDesc, checked && styles.taskDescChecked]}>
                      {task.desc}
                    </Text>
                  </View>
                  <Text style={[styles.taskTime, checked && styles.taskTimeChecked]}>
                    {task.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDate: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  todayLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#36A06F',
    marginTop: 2,
    marginBottom: 16,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    alignItems: 'center',
    backgroundColor: '#A9DDBF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
    flex: 1,
    marginHorizontal: 2,
  },
  dayPillSelected: {
    backgroundColor: '#1F6B45',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dayLabelSelected: {
    color: '#F5F5F5',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  dayNumberSelected: {
    color: '#F5F5F5',
  },
  emptyText: {
    fontSize: 15,
    color: '#808080',
    textAlign: 'center',
    marginTop: 24,
  },
  timeline: {
    paddingBottom: 24,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 12,
  },
  checkboxColumn: {
    alignItems: 'center',
    width: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#36A06F',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#36A06F',
  },
  connectorLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#36A06F',
    marginVertical: 2,
  },
  taskCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardChecked: {
    backgroundColor: '#36A06F',
  },
  taskCardText: {
    flex: 1,
    gap: 2,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  taskNameChecked: {
    color: '#F5F5F5',
  },
  taskDesc: {
    fontSize: 13,
    color: '#4D4D4D',
  },
  taskDescChecked: {
    color: '#E6F5EC',
  },
  taskTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  taskTimeChecked: {
    color: '#F5F5F5',
  },
});