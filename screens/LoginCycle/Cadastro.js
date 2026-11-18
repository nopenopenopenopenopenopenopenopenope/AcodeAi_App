import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import React, { useEffect } from 'react';
import { getStoredUser, registrarUsuario } from '../../components/storageFuncs';
import {
  limparTexto,
  validarNome,
  validarEmail,
  validarTelefone,
  validarSenha,
} from '../../components/validacao';
import { TERMOS_DE_USO, POLITICA_PRIVACIDADE } from '../../components/termosTexto';
import { Feather } from '@expo/vector-icons';

const prototypeHeight = Dimensions.get('window').height;
const prototypeWidth = Dimensions.get('window').width;

export default function Cadastro({ navigation, onAuthenticated }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [pword, setPword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [confirmPword, setConfirmPword] = React.useState('');
  const [errado, setErrado] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [showPword, setShowPword] = React.useState(false);
  // aceite dos Termos de Uso e da Política de Privacidade
  const [aceitou, setAceitou] = React.useState(false);
  // qual texto está aberto no modal: null | 'termos' | 'privacidade'
  const [modal, setModal] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        onAuthenticated?.(storedUser);
      }
    };

    fetchData();
  }, []);

  function mostrarErro(msg) {
    setErro(msg);
    setErrado(true);
    setTimeout(() => setErrado(false), 3000);
    setLoading(false);
  }

  async function cadastrar() {
    if (loading) return;
    setLoading(true);
    setErrado(false);

    const nomeLimpo = limparTexto(name, 100);

    if (!nomeLimpo || !email.trim() || !phone.trim() || !pword || !confirmPword) {
      return mostrarErro('Todos os campos devem ser preenchidos');
    }

    // Validação de formato (experiência do usuário). A garantia real fica
    // no Supabase (política de senha, RLS e constraints).
    const erroCampo =
      validarNome(nomeLimpo) ||
      validarEmail(email) ||
      validarTelefone(phone) ||
      validarSenha(pword);
    if (erroCampo) return mostrarErro(erroCampo);

    if (pword !== confirmPword) {
      return mostrarErro('As senhas não coincidem');
    }

    if (!aceitou) {
      return mostrarErro('Aceite os Termos de Uso e a Política de Privacidade para continuar');
    }

    try {
      const usuarioCriado = await registrarUsuario({
        name: nomeLimpo,
        email: email.trim(),
        phone: phone.trim(),
        pword,
        aceitouTermos: aceitou,
      });

      if (!usuarioCriado) {
        return mostrarErro('Não foi possível concluir o cadastro');
      }

      // Limpa os campos
      setName('');
      setEmail('');
      setPhone('');
      setPword('');
      setConfirmPword('');
      setAceitou(false);
      setErrado(false);
      setLoading(false);

      navigation.navigate('login', { pword: pword });
    } catch (error) {
      if (__DEV__) console.log(error);
      mostrarErro('Erro ao salvar dados');
    }
  }

  const botaoDesabilitado = loading || !aceitou;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image style={[styles.logotipo,{minWidth:prototypeWidth / 2,height: prototypeHeight / 7}]} source={require('../../assets/Logo.png')} />
        <Text style={styles.textoBemVindo}>Seja bem vindo!</Text>
        <Text style={styles.subtextoBemVindo}>Crie sua conta para continuar</Text>

        <View style={styles.conjuntoInputs}>
          <View style={styles.item}>
            <Text>Nome</Text>
            <TextInput
              keyboardType="default"
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#B3B3B3"
              value={String(name)}
              onChangeText={(text) => {
                setName(text);
              }}
              autoComplete="name"
              maxLength={100}
            />
          </View>

          <View style={styles.item}>
            <Text>E-mail</Text>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#B3B3B3"
              value={String(email)}
              onChangeText={(text) => {
                setEmail(text);
              }}
              autoComplete="email"
              maxLength={254}
            />
          </View>

          <View style={styles.item}>
            <Text>Telefone</Text>
            <TextInput
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="(00) 9 0000-0000"
              placeholderTextColor="#B3B3B3"
              value={String(phone)}
              onChangeText={(text) => {
                setPhone(text);
              }}
              autoComplete="tel"
              maxLength={20}
            />
          </View>

          <View style={styles.item}>
            <Text>Senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                keyboardType="default"
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPword}
                placeholder="Senha"
                placeholderTextColor="#B3B3B3"
                value={String(pword)}
                onChangeText={(text) => {
                  setPword(text);
                }}
                autoComplete="new-password"
                maxLength={72}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPword(!showPword)}>
                <Feather name={showPword ? 'eye-off' : 'eye'} size={18} color="#808080" />
              </TouchableOpacity>
            </View>
            <Text style={styles.dica}>
              Mínimo de 8 caracteres, com letra maiúscula, minúscula e número.
            </Text>
          </View>

          <View style={styles.item}>
            <Text>Confirmar senha</Text>
            <View style={styles.passwordRow}>
              <TextInput
                keyboardType="default"
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPword}
                placeholder="Confirmar senha"
                placeholderTextColor="#B3B3B3"
                value={String(confirmPword)}
                onChangeText={(text) => {
                  setConfirmPword(text);
                }}
                autoComplete="new-password"
                maxLength={72}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPword(!showPword)}>
                <Feather name={showPword ? 'eye-off' : 'eye'} size={18} color="#808080" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Aceite dos termos */}
        <View style={styles.termosRow}>
          <TouchableOpacity
            onPress={() => setAceitou(!aceitou)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: aceitou }}
            accessibilityLabel="Aceitar os Termos de Uso e a Política de Privacidade"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name={aceitou ? 'check-square' : 'square'} size={22} color="#36A06F" />
          </TouchableOpacity>
          <Text style={styles.termosText}>
            Li e aceito os{' '}
            <Text style={styles.loginLink} onPress={() => setModal('termos')}>
              Termos de Uso
            </Text>{' '}
            e a{' '}
            <Text style={styles.loginLink} onPress={() => setModal('privacidade')}>
              Política de Privacidade
            </Text>
            .
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, botaoDesabilitado && styles.buttonDisabled]}
          onPress={() => cadastrar()}
          disabled={botaoDesabilitado}>
          <Text style={{ color: '#F5F5F5' }}>{loading ? 'Cadastrando...' : 'Cadastrar-se'}</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já possui uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {errado && <Text style={styles.errorText}>{erro}</Text>}
      </ScrollView>

      {/* Modal com o texto completo */}
      <Modal
        visible={modal !== null}
        animationType="slide"
        onRequestClose={() => setModal(null)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {modal === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}
          </Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator>
            <Text style={styles.modalText}>
              {modal === 'termos' ? TERMOS_DE_USO : POLITICA_PRIVACIDADE}
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={() => setModal(null)}>
            <Text style={{ color: '#F5F5F5' }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    minHeight: '100%',
    justifyContent:'center',
    padding: 16,
    paddingTop: 32,
  },
  logotipo: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  textoBemVindo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#36A06F',
    textAlign: 'center',
  },
  subtextoBemVindo: {
    fontSize: 14,
    color: '#4D4D4D',
    textAlign: 'center',
    marginBottom: 16,
  },
  conjuntoInputs: {
    gap: 12,
  },
  item: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  dica: {
    fontSize: 12,
    color: '#808080',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
  },
  termosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  termosText: {
    flex: 1,
    color: '#4D4D4D',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#4D4D4D',
  },
  loginLink: {
    color: '#36A06F',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#B34747',
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    paddingTop: 48,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#36A06F',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    padding: 12,
  },
  modalText: {
    color: '#333333',
    fontSize: 14,
    lineHeight: 21,
  },
});