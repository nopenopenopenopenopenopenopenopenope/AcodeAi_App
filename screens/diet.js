import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/*
  Reads paciente.diet (see screens/info.js for the full shape).
  - metas: diet.calories.goal, diet.macros.*.goal, diet.water.goal
  - consumo: diet.records (um item por refeição/copo, com a data 'yyyy-mm-dd');
    a tela soma os registros do dia selecionado na semana.
  Os botões de registrar mandam o dia selecionado em `date`, e o App.js
  (saveDiet) grava o consumo nesse dia.
*/

const WEEKDAY_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const pad2 = (n) => String(n).padStart(2, '0');

// 'yyyy-mm-dd' no fuso do aparelho (mesmo formato dos registros)
const toIso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const formatDayBr = (d) => `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;

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

const formatThousands = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const formatWaterAmount = (ml) => {
  const liters = Math.floor(ml / 1000);
  const remainderMl = Math.round(ml % 1000);
  if (liters === 0) return `${remainderMl} ml`;
  if (remainderMl === 0) return `${liters} L`;
  return `${liters} L e ${remainderMl} ml`;
};

const percentOf = (entry) => {
  if (!entry?.goal) return 0;
  return Math.max(0, Math.min(100, (entry.current / entry.goal) * 100));
};

// Porcentagem sem o teto de 100 (para mostrar quando passa da meta)
const rawPercentOf = (entry) => {
  if (!entry?.goal) return 0;
  return Math.max(0, Math.round((entry.current / entry.goal) * 100));
};

function ProgressRing({ percent, size, strokeWidth, trackColor, fillColor, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}

function MacroBar({ percent }) {
  return (
    <View style={styles.macroBarTrack}>
      <View style={[styles.macroBarFill, { width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

// Mostra o consumido e a meta: "40 / 250 g"
function Macro({ emoji, label, current, goal, percent }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroEmoji}>{emoji}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <MacroBar percent={percent} />
      <Text style={styles.macroValue}>
        {Math.round(current)} / {Math.round(goal)} g
      </Text>
    </View>
  );
}

export default function Diet({ paciente, func }) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDates = getWeekDates(selectedDate);

  const selectedIso = toIso(selectedDate);
  const isToday = isSameDay(selectedDate, today);

  const diet = paciente?.diet;

  // Consumo do dia selecionado: soma dos registros daquela data. Se o storage
  // não mandar `records` (versão antiga), cai nos totais de hoje.
  const hasRecords = Array.isArray(diet?.records);
  const consumed = (key, todayFallback) => {
    if (!hasRecords) return isToday ? todayFallback ?? 0 : 0;
    return diet.records
      .filter((r) => r.date === selectedIso)
      .reduce((acc, r) => acc + (r[key] ?? 0), 0);
  };

  const macros = diet?.macros ?? {};
  const calories = {
    current: consumed('calories', diet?.calories?.current),
    goal: diet?.calories?.goal ?? 0,
  };
  const carbs = {
    current: consumed('carbs', macros.carbs?.current),
    goal: macros.carbs?.goal ?? 0,
  };
  const protein = {
    current: consumed('protein', macros.protein?.current),
    goal: macros.protein?.goal ?? 0,
  };
  const lipids = {
    current: consumed('lipids', macros.lipids?.current),
    goal: macros.lipids?.goal ?? 0,
  };
  const water = {
    current: consumed('water', diet?.water?.current),
    goal: diet?.water?.goal ?? 0,
  };
  const allergies = diet?.restrictions?.allergies ?? [];
  const intolerances = diet?.restrictions?.intolerances ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Alimentação</Text>

      <TouchableOpacity disabled={isToday} onPress={() => setSelectedDate(today)}>
        <Text style={styles.todayLabel}>
          {isToday ? 'Hoje' : `${formatDayBr(selectedDate)} (voltar para hoje)`}
        </Text>
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
      ) : !diet ? (
        <>
          <Text style={styles.emptyText}>Nenhuma dieta configurada</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => func?.('diet', { section: 'goals' })}
          >
            <Text style={styles.buttonText}>Configurar metas</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.calorieCard}>
            <ProgressRing
              percent={percentOf(calories)}
              size={140}
              strokeWidth={12}
              trackColor="#1F5C43"
              fillColor="#7ED9A8"
            >
              <Text style={styles.calorieValue}>{formatThousands(calories.current)}</Text>
              <Text style={styles.calorieGoal}>de {formatThousands(calories.goal)} kcal</Text>
            </ProgressRing>

            <View style={styles.macrosRow}>
              <Macro
                emoji="🍞"
                label="Carboidratos"
                current={carbs.current}
                goal={carbs.goal}
                percent={percentOf(carbs)}
              />
              <Macro
                emoji="🫒"
                label="Lipídios"
                current={lipids.current}
                goal={lipids.goal}
                percent={percentOf(lipids)}
              />
            </View>
            <View style={styles.macrosCenterRow}>
              <Macro
                emoji="🥩"
                label="Proteínas"
                current={protein.current}
                goal={protein.goal}
                percent={percentOf(protein)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => func?.('diet', { section: 'meal', date: selectedIso })}
          >
            <Text style={styles.buttonText}>Registrar refeição</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              func?.('diet', {
                section: 'goals',
                calories: calories.goal || '',
                carbs: carbs.goal || '',
                protein: protein.goal || '',
                lipids: lipids.goal || '',
              })
            }
          >
            <Text style={styles.buttonText}>Modificar</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Consumo de Água</Text>
          <View style={styles.waterWrap}>
            <ProgressRing
              percent={percentOf(water)}
              size={220}
              strokeWidth={18}
              trackColor="#0E4D66"
              fillColor="#3FB4E0"
            >
              <Text style={styles.waterEmoji}>💧</Text>
              <Text style={styles.waterPercent}>{rawPercentOf(water)}%</Text>
              <Text style={styles.waterAmount}>{formatWaterAmount(water.current)}</Text>
              {!!water.goal && (
                <Text style={styles.waterGoal}>de {formatWaterAmount(water.goal)}</Text>
              )}
            </ProgressRing>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              func?.('diet', { section: 'water', water: water.goal || '', date: selectedIso })
            }
          >
            <Text style={styles.buttonText}>Modificar</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Restrições Alimentares</Text>

          <Text style={styles.subTitle}>Alergias</Text>
          {allergies.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma alergia registrada</Text>
          ) : (
            allergies.map((item, index) => (
              <Text key={index} style={styles.listItem}>{item}</Text>
            ))
          )}

          <Text style={[styles.subTitle, styles.subTitleSpaced]}>Intolerâncias Alimentares</Text>
          {intolerances.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma intolerância registrada</Text>
          ) : (
            intolerances.map((item, index) => (
              <Text key={index} style={styles.listItem}>{item}</Text>
            ))
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              func?.('diet', {
                section: 'restrictions',
                allergies: allergies.join(', '),
                intolerances: intolerances.join(', '),
              })
            }
          >
            <Text style={styles.buttonText}>Modificar</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#36A06F',
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 32,
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
    marginBottom: 16,
  },
  calorieCard: {
    backgroundColor: '#1F5C43',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  calorieGoal: {
    fontSize: 12,
    color: '#F5F5F5',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  macrosCenterRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  macro: {
    alignItems: 'center',
    width: 110,
    gap: 4,
  },
  macroEmoji: {
    fontSize: 28,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  macroBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(245,245,245,0.25)',
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#7ED9A8',
  },
  macroValue: {
    fontSize: 13,
    color: '#F5F5F5',
  },
  button: {
    backgroundColor: '#1F6B45',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  buttonText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#36A06F',
    textAlign: 'center',
  },
  sectionTitleSpaced: {
    marginTop: 24,
    marginBottom: 16,
  },
  waterWrap: {
    alignItems: 'center',
  },
  waterEmoji: {
    fontSize: 22,
  },
  waterPercent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  waterAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F5F5',
  },
  waterGoal: {
    fontSize: 12,
    color: '#F5F5F5',
  },
  subTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#36A06F',
    marginBottom: 6,
  },
  subTitleSpaced: {
    marginTop: 16,
  },
  listItem: {
    fontSize: 15,
    color: '#1A1A1A',
    marginLeft: 12,
    marginBottom: 2,
  },
});