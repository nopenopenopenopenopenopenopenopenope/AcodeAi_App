import * as DeviceCalendar from 'expo-calendar/legacy';
import { Alert, Platform } from 'react-native';

function buildStartDate(dateStr, timeStr) {
  const [day, month, year] = String(dateStr ?? '').split('/').map(Number);
  const base = day && month && year ? new Date(year, month - 1, day) : new Date();

  const match = String(timeStr ?? '').match(/(\d+)[h:](\d+)/);
  if (match) {
    base.setHours(Number(match[1]), Number(match[2]), 0, 0);
  } else {
    base.setHours(9, 0, 0, 0);
  }
  return base;
}

async function getDefaultCalendarId() {
  if (Platform.OS === 'ios') {
    const defaultCal = await DeviceCalendar.getDefaultCalendarAsync();
    return defaultCal.id;
  }

  const calendars = await DeviceCalendar.getCalendarsAsync(DeviceCalendar.EntityTypes.EVENT);
  const writable =
    calendars.find((c) => c.isPrimary && c.allowsModifications) ||
    calendars.find((c) => c.allowsModifications);

  return writable?.id ?? null;
}

export async function addTaskToDeviceCalendar(task) {
  if (Platform.OS === 'web') {
    Alert.alert('Indisponível', 'A integração com a agenda nativa funciona apenas no celular.');
    return false;
  }

  const { status } = await DeviceCalendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão negada', 'Libere o acesso ao calendário nas configurações para salvar eventos.');
    return false;
  }

  const calendarId = await getDefaultCalendarId();
  if (!calendarId) {
    Alert.alert('Erro', 'Nenhum calendário disponível encontrado neste aparelho.');
    return false;
  }

  const startDate = buildStartDate(task.date, task.time);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

  const location = [task.place, task.address].filter(Boolean).join(' - ');
  const notes = [task.desc, task.professional ? `Profissional: ${task.professional}` : '']
    .filter(Boolean)
    .join('\n');

  try {
    await DeviceCalendar.createEventAsync(calendarId, {
      title: task.name,
      startDate,
      endDate,
      notes,
      location: location || undefined,
      alarms: [{ relativeOffset: -15 }],
    });

    Alert.alert('Adicionado!', `"${task.name}" foi salvo na agenda do seu celular.`);
    return true;
  } catch (error) {
    if (__DEV__) console.error('Erro ao salvar na agenda nativa:', error);
    Alert.alert('Erro', 'Não foi possível adicionar o evento à agenda do celular.');
    return false;
  }
}