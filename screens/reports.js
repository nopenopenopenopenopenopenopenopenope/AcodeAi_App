import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
  Reads paciente.reports and paciente.checkins (see screens/info.js for
  the full shapes, sourced from ReportF's and CheckInF's outputs).
*/

function ReportCard({ report }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Feather name="file-text" size={32} color="#36A06F" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{report.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Relatório</Text>
          <Text style={styles.metaDate}>{report.date}</Text>
        </View>
        {!!report.notes && (
          <Text style={styles.bodyText}>
            <Text style={styles.bodyLabel}>Observação: </Text>
            {report.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

function CheckInCard({ checkin }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Feather name="heart" size={32} color="#36A06F" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>Check-In Diário</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaDate}>{checkin.date}</Text>
          {!!checkin.feeling && <Text style={styles.metaLabel}>{checkin.feeling}</Text>}
        </View>
        {!!checkin.moodChange && <Text style={styles.bodyText}>{checkin.moodChange}</Text>}
      </View>
    </View>
  );
}

export default function Reports({ paciente, func }) {
  const reports = paciente?.reports ?? [];
  const checkins = paciente?.checkins ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Relatórios</Text>
        <TouchableOpacity onPress={() => func?.('report')}>
          <Feather name="plus" size={26} color="#36A06F" />
        </TouchableOpacity>
      </View>
      {reports.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum relatório registrado</Text>
      ) : (
        reports.map((report, index) => <ReportCard key={index} report={report} />)
      )}

      <View style={[styles.headerRow, styles.headerRowSpaced]}>
        <Text style={styles.sectionTitle}>Check-ins</Text>
        <TouchableOpacity onPress={() => func?.('check')}>
          <Feather name="plus" size={26} color="#36A06F" />
        </TouchableOpacity>
      </View>
      {checkins.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum check-in registrado</Text>
      ) : (
        checkins.map((checkin, index) => <CheckInCard key={index} checkin={checkin} />)
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
    marginBottom: 12,
  },
  headerRowSpaced: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#36A06F',
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
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  metaDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  bodyText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  bodyLabel: {
    fontWeight: '600',
  },
});