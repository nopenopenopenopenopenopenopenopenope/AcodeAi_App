import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/*
  Reads paciente.diet (see screens/info.js for the full shape). There is
  no DietF form yet, so "Modificar" just calls func('diet') — harmless
  no-op today, ready to open a form once one exists in forms/ and is
  registered in App.js's `forms` map.
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

function Macro({ emoji, label, grams, percent }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroEmoji}>{emoji}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <MacroBar percent={percent} />
      <Text style={styles.macroValue}>{grams} g</Text>
    </View>
  );
}

export default function Diet({ paciente, func }) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const weekDates = getWeekDates(selectedDate);

  const diet = paciente?.diet;
  const calories = diet?.calories ?? { current: 0, goal: 0 };
  const macros = diet?.macros ?? {};
  const carbs = macros.carbs ?? { current: 0, goal: 0 };
  const protein = macros.protein ?? { current: 0, goal: 0 };
  const lipids = macros.lipids ?? { current: 0, goal: 0 };
  const water = diet?.water ?? { current: 0, goal: 0 };
  const allergies = diet?.restrictions?.allergies ?? [];
  const intolerances = diet?.restrictions?.intolerances ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Alimentação</Text>

      <TouchableOpacity onPress={() => setSelectedDate(today)}>
        <Text style={styles.todayLabel}>Hoje</Text>
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

      {!diet ? (
        <Text style={styles.emptyText}>Nenhuma dieta configurada</Text>
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
              <Text style={styles.calorieValue}>{formatThousands(calories.goal)} kcal</Text>
            </ProgressRing>

            <View style={styles.macrosRow}>
              <Macro emoji="🍞" label="Carboidratos" grams={carbs.goal} percent={percentOf(carbs)} />
              <Macro emoji="🫒" label="Lipídios" grams={lipids.goal} percent={percentOf(lipids)} />
            </View>
            <View style={styles.macrosCenterRow}>
              <Macro emoji="🥩" label="Proteínas" grams={protein.goal} percent={percentOf(protein)} />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => func?.('diet')}>
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
              <Text style={styles.waterPercent}>{Math.round(percentOf(water))}%</Text>
              <Text style={styles.waterAmount}>{formatWaterAmount(water.current)}</Text>
            </ProgressRing>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => func?.('diet')}>
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

          <TouchableOpacity style={styles.button} onPress={() => func?.('diet')}>
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
    fontSize: 16,
    fontWeight: 'bold',
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