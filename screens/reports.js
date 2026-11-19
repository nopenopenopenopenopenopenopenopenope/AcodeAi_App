import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

/*
  Reads paciente.reports and paciente.checkins.
  Adiciona suporte para ver o relatório completo, editar e apagar.
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

export default function Reports({ paciente, func, onDeleteReport }) {
  const reports = paciente?.reports ?? [];
  const checkins = paciente?.checkins ?? [];

  // Estado para controlar o modal de visualização completa do relatório
  const [selectedReport, setSelectedReport] = useState(null);

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
        checkins.map((checkin, index) => <CheckInCard key={index} checkin={checkin} />)
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
});