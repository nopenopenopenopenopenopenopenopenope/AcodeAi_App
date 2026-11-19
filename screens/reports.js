import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
  Reads paciente.reports and paciente.checkins.
  Adiciona suporte para ver o relatório completo, editar e apagar.
  Os check-ins também abrem em detalhe ao tocar (campos + medições do dia).
*/

function ReportCard({ report, onOpenDetail, onEdit, onDelete }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onOpenDetail(report)}>
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
          <Text style={styles.bodyText} numberOfLines={2}>
            <Text style={styles.bodyLabel}>Observação: </Text>
            {report.notes}
          </Text>
        )}
      </View>

      {/* Botões de Ação rápida (Editar e Apagar) */}
      <View style={styles.actionButtonsCol}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(report)}>
          <Feather name="edit-2" size={16} color="#36A06F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(report.id)}>
          <Feather name="trash-2" size={16} color="#D64545" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function CheckInCard({ checkin, onOpenDetail }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onOpenDetail(checkin)}>
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
      <Feather name="chevron-right" size={20} color="#B3B3B3" />
    </TouchableOpacity>
  );
}

// Linha "rótulo + valor" do detalhe do check-in; campo vazio mostra "Não informado".
function DetailField({ label, value }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.modalSubtitle}>{label}</Text>
      <Text style={[styles.modalBodyText, !value && styles.fieldEmpty]}>
        {value || 'Não informado'}
      </Text>
    </View>
  );
}

export default function Reports({ paciente, func, onDeleteReport }) {
  const reports = paciente?.reports ?? [];
  const checkins = paciente?.checkins ?? [];

  // Estados dos modais de visualização completa
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedCheckin, setSelectedCheckin] = useState(null);

  // Medições (bpm/pressão e peso) registradas no mesmo dia do check-in aberto.
  // Elas ficam em tabelas próprias e só têm a data em comum com o check-in.
  const dayVitals = selectedCheckin
    ? (paciente?.vitals ?? []).filter((v) => v.date === selectedCheckin.date)
    : [];
  const dayWeights = selectedCheckin
    ? (paciente?.weightHistory ?? []).filter((w) => w.date === selectedCheckin.date)
    : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Relatórios</Text>
        {paciente && (
          <TouchableOpacity onPress={() => func?.('report')}>
            <Feather name="plus" size={26} color="#36A06F" />
          </TouchableOpacity>
        )}
      </View>

      {reports.length === 0 ? (
        !paciente ? (
          <Text style={styles.emptyText}>Nenhum paciente selecionado</Text>
        ) : (
          <Text style={styles.emptyText}>Nenhum relatório registrado</Text>
        )
      ) : (
        reports.map((report, index) => (
          <ReportCard
            key={report.id ?? index}
            report={report}
            onOpenDetail={(r) => setSelectedReport(r)}
            onEdit={(r) => func('report', r)}
            onDelete={(id) => onDeleteReport?.(id)}
          />
        ))
      )}

      <View style={[styles.headerRow, styles.headerRowSpaced]}>
        <Text style={styles.sectionTitle}>Check-ins</Text>
        {paciente && (
          <TouchableOpacity onPress={() => func?.('check')}>
            <Feather name="plus" size={26} color="#36A06F" />
          </TouchableOpacity>
        )}
      </View>

      {checkins.length === 0 ? (
        !paciente ? (
          <Text style={styles.emptyText}>Nenhum paciente selecionado</Text>
        ) : (
          <Text style={styles.emptyText}>Nenhum check-in registrado</Text>
        )
      ) : (
        checkins.map((checkin, index) => (
          <CheckInCard
            key={checkin.id ?? index}
            checkin={checkin}
            onOpenDetail={(c) => setSelectedCheckin(c)}
          />
        ))
      )}

      {/* Modal para ver o relatório completo */}
      <Modal
        visible={!!selectedReport}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedReport?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)}>
                <Feather name="x" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDate}>Data: {selectedReport?.date}</Text>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>Conteúdo do Relatório:</Text>
              <Text style={styles.modalBodyText}>{selectedReport?.body || 'Sem conteúdo.'}</Text>

              {!!selectedReport?.notes && (
                <>
                  <Text style={[styles.modalSubtitle, { marginTop: 12 }]}>Observações:</Text>
                  <Text style={styles.modalBodyText}>{selectedReport?.notes}</Text>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSelectedReport(null)}
            >
              <Text style={styles.closeModalBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para ver o check-in completo */}
      <Modal
        visible={!!selectedCheckin}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedCheckin(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Check-In Diário</Text>
              <TouchableOpacity onPress={() => setSelectedCheckin(null)}>
                <Feather name="x" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDate}>Data: {selectedCheckin?.date}</Text>

            <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
              <DetailField label="Como o paciente estava se sentindo" value={selectedCheckin?.feeling} />
              <DetailField label="Sono" value={selectedCheckin?.sleep} />
              <DetailField label="Alteração de humor" value={selectedCheckin?.moodChange} />
              <DetailField label="Observações extras" value={selectedCheckin?.notes} />

              <Text style={[styles.modalSubtitle, styles.measuresTitle]}>Medições do dia</Text>
              {dayVitals.length === 0 && dayWeights.length === 0 ? (
                <Text style={[styles.modalBodyText, styles.fieldEmpty]}>
                  Nenhuma medição registrada neste dia.
                </Text>
              ) : (
                <>
                  {dayVitals.map((v) => (
                    <View key={`v-${v.id}`} style={styles.measureRow}>
                      <Text style={styles.measureTime}>{v.hour}</Text>
                      <Text style={styles.measureValue}>
                        {v.bpm != null ? `${v.bpm} bpm` : '—'}  ·  Pressão {v.pressure || '—'}
                      </Text>
                    </View>
                  ))}
                  {dayWeights.map((w) => (
                    <View key={`w-${w.id}`} style={styles.measureRow}>
                      <Text style={styles.measureTime}>{w.hour}</Text>
                      <Text style={styles.measureValue}>Peso {w.value}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setSelectedCheckin(null)}
            >
              <Text style={styles.closeModalBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerRowSpaced: { marginTop: 12 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#36A06F' },
  emptyText: { fontSize: 15, color: '#808080', marginBottom: 16 },
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
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#36A06F' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  metaLabel: { fontSize: 13, color: '#1A1A1A' },
  metaDate: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' },
  bodyText: { fontSize: 13, color: '#4D4D4D' },
  bodyLabel: { fontWeight: '600' },
  actionButtonsCol: { gap: 8, justifyContent: 'center', paddingLeft: 4 },
  actionBtn: { padding: 6, backgroundColor: '#F5F5F5', borderRadius: 6 },

  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    gap: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#36A06F', flex: 1, marginRight: 8 },
  modalDate: { fontSize: 14, color: '#808080', fontWeight: '600' },
  modalBodyScroll: { marginVertical: 4 },
  modalSubtitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  modalBodyText: { fontSize: 15, color: '#333333', lineHeight: 22 },
  closeModalBtn: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeModalBtnText: { color: '#F5F5F5', fontWeight: 'bold', fontSize: 16 },

  // Detalhe do check-in
  fieldBlock: { marginBottom: 12 },
  fieldEmpty: { color: '#808080', fontStyle: 'italic' },
  measuresTitle: { marginTop: 4 },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    gap: 8,
  },
  measureTime: { fontSize: 13, color: '#808080' },
  measureValue: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', flexShrink: 1, textAlign: 'right' },
});