import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Profile (caregiver) object shape, provided by the navigator. It also
 * carries the caregiver's patient references — not the patient records
 * themselves, those live in a separate `pacients` array/store:
 * {
 *   name: string,             // "Reginaldo Alves"
 *   role: string,             // "Cuidador"
 *   email: string,            // "alvesreg@exemploemail.com"
 *   phone: string,            // "(00) 9 000-0000"
 *   senha: string,            // plain/decrypted password to display when revealed
 *   foto: string | null,      // avatar uri
 *   pacientIds: string[],     // ids of the patients this caregiver has registered
 *   pacientsLimit: number,    // max number of patients this account may register
 *   selectedPacient: string | null,  // id of the currently active patient (matches pacients[].id)
 *   stockId: string | null,   // id of the stock this user belongs to (a user has at most one)
 * }
 *
 * `pacients` (separate prop) holds the actual records:
 * [
 *   {
 *     id: string,          // unique id, matched against profile.pacientIds
 *     name: string,        // "Samantha Silveira"
 *     senha: string,       // patient login password to display when revealed
 *     ...                  // plus whatever else Info/Medicine need (birthDate, medicines, etc.)
 *   },
 *   ...
 * ]
 *
 * Pass an empty `pacientIds` array (selectedPacient is ignored when empty)
 * when the caregiver has no patient registered yet.
 */

export default function Profile({ navigation, profile, pacients, func, onSelectPacient }) {
  const [showSenha, setShowSenha] = useState(false);
  const [showPacienteSenha, setShowPacienteSenha] = useState(false);

  const pacientIds = profile?.pacientIds ?? [];
  const myPacients = pacientIds
    .map((id) => pacients?.find((p) => p.id === id))
    .filter(Boolean);
  const pacientsLimit = profile?.pacientsLimit ?? myPacients.length;
  const paciente = myPacients.find((p) => p.id === profile?.selectedPacient) ?? null;
  const atLimit = myPacients.length >= pacientsLimit;

  const handlePacienteButton = () => {
    if (paciente) {
      navigation.navigate('Info');
    } else {
      func('pacient');
    }
  };

  const handleAddPacient = () => {
    if (atLimit) return;
    func('pacient');
  };

  const handleConnectPacient = () => {
    if (atLimit) return;
    func('connectPacient');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.avatarWrapper}>
        {profile?.foto ? (
          <Image source={{ uri: profile.foto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Feather name="user" size={56} color="#B3B3B3" />
          </View>
        )}
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.name}>{profile?.name}</Text>
        <TouchableOpacity onPress={() => {}}>
          <Feather name="edit-2" size={18} color="#36A06F" />
        </TouchableOpacity>
      </View>
      <Text style={styles.role}>{profile?.role}</Text>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Feather name="mail" size={18} color="#333333" />
          <Text style={styles.label}>E-mail</Text>
        </View>
        <Text style={styles.value}>{profile?.email}</Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Feather name="smartphone" size={18} color="#333333" />
          <Text style={styles.label}>Celular</Text>
        </View>
        <Text style={styles.value}>{profile?.phone}</Text>
      </View>
      <View style={styles.divider} />

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Feather name="lock" size={18} color="#333333" />
          <Text style={styles.label}>Senha</Text>
        </View>
        <View style={styles.secretRow}>
          <Text style={styles.value}>{showSenha ? profile?.senha : '****************'}</Text>
          <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
            <Feather name={showSenha ? 'eye-off' : 'eye'} size={18} color="#808080" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />

      <View style={styles.field}>
        <View style={styles.labelRowSpaceBetween}>
          <View style={styles.labelRow}>
            <Feather name="heart" size={18} color="#333333" />
            <Text style={styles.label}>
              Login do Paciente {myPacients.length > 0 ? `(${myPacients.length}/${pacientsLimit})` : ''}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleConnectPacient} disabled={atLimit}>
              <Feather name="link" size={20} color={atLimit ? '#CCCCCC' : '#36A06F'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddPacient} disabled={atLimit}>
              <Feather name="plus-circle" size={20} color={atLimit ? '#CCCCCC' : '#36A06F'} />
            </TouchableOpacity>
          </View>
        </View>
        {atLimit && (
          <Text style={styles.limitNote}>Limite de pacientes atingido</Text>
        )}
      </View>

      {myPacients.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pacientSwitcher}
          contentContainerStyle={styles.pacientSwitcherContent}
        >
          {myPacients.map((p, index) => {
            const isSelected = p.id === profile?.selectedPacient;
            return (
              <TouchableOpacity
                key={p.id ?? index}
                style={[styles.pacientChip, isSelected && styles.pacientChipSelected]}
                onPress={() => onSelectPacient(p.id)}
              >
                <Text style={[styles.pacientChipText, isSelected && styles.pacientChipTextSelected]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <Text style={styles.value}>{paciente ? paciente.name : 'Nenhum paciente logado'}</Text>


      <View style={styles.divider} />

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handlePacienteButton}>
          <Text style={styles.buttonPrimaryText}>
            {paciente ? 'Paciente logado' : 'Logar novo paciente'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const AVATAR_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: 8,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#36A06F',
  },
  role: {
    textAlign: 'center',
    color: '#4D4D4D',
    marginBottom: 16,
  },
  field: {
    gap: 6,
    paddingVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelRowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  limitNote: {
    fontSize: 12,
    color: '#B34747',
    marginLeft: 28,
    marginTop: 2,
  },
  value: {
    fontSize: 15,
    color: '#4D4D4D',
    marginLeft: 28,
  },
  secretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 28,
    paddingRight: 8,
  },
  secretRowStandalone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  secretValue: {
    flex: 1,
    marginLeft: 0,
  },
  pacientSwitcher: {
    marginTop: 8,
  },
  pacientSwitcherContent: {
    gap: 8,
    paddingBottom: 4,
    paddingLeft: 28,
  },
  pacientChip: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pacientChipSelected: {
    backgroundColor: '#36A06F',
    borderColor: '#36A06F',
  },
  pacientChipText: {
    fontSize: 13,
    color: '#4D4D4D',
  },
  pacientChipTextSelected: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginTop: 10,
  },
  buttonGroup: {
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
  },
  buttonPrimary: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
});