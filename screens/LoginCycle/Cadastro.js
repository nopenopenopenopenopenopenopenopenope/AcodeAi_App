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
  Dimensions
} from 'react-native';
import React, { useEffect } from 'react';
import { getStoredUser, registrarUsuario } from '../../components/storageFuncs';
import { Feather } from '@expo/vector-icons';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const prototypeHeight = Dimensions.get('window').height;
const prototypeWidth = Dimensions.get('window').width;
export default function Cadastro({ navigation, onAuthenticated }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [pword, setPword] = React.useState('');
  const [loading,setLoading] = React.useState(false);
  const [confirmPword, setConfirmPword] = React.useState('');
  const [errado, setErrado] = React.useState(false);
  const [erro, setErro] = React.useState(false);
  const [showPword, setShowPword] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        onAuthenticated?.(storedUser);
      }
    };

    fetchData();
  }, []);

  async function cadastrar() {
    setLoading(true)
    setErro(null);
    setErrado(true);

    if (!name || !email || !phone || !pword || !confirmPword) {
      setErro('Todos os campos devem ser preenchidos');
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      setLoading(false)
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setErro('E-mail inválido');
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      setLoading(false)
      return;
    }

    if (pword.length < 6) {
      setErro('Sua senha deve possuir pelo menos 6 caracteres');
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      setLoading(false)
      return;
    }

    if (pword !== confirmPword) {
      setErro('As senhas não coincidem');
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      setLoading(false)
      return;
    }

    try {
      const novoUsuario = {
        name,
        email,
        phone,
        pword,
        registered: [],
      };
      const usuarioCriado = await registrarUsuario(novoUsuario);

      if (!usuarioCriado) {
        setErro('Não foi possível concluir o cadastro');
        setTimeout(() => {
          setErrado(false);
        }, 2000);
        setLoading(false)
        return;
      }

      // Limpa os campos
      setName('');
      setEmail('');
      setPhone('');
      setPword('');
      setConfirmPword('');
      setErrado(false);

      navigation.navigate('login', { pword: pword });
    } catch (error) {
      setErro('Novo Erro ao salvar dados');
      console.log(error);
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      return;
    }
    setLoading(false)
  }

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
            />
          </View>

          <View style={styles.item}>
            <Text>Telefone</Text>
            <TextInput
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="(00) 9 000-0000"
              placeholderTextColor="#B3B3B3"
              value={String(phone)}
              onChangeText={(text) => {
                setPhone(text);
              }}
              autoComplete="tel"
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
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPword(!showPword)}>
                <Feather name={showPword ? 'eye-off' : 'eye'} size={18} color="#808080" />
              </TouchableOpacity>
            </View>
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
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPword(!showPword)}>
                <Feather name={showPword ? 'eye-off' : 'eye'} size={18} color="#808080" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => cadastrar() } disabled={loading}>
          <Text style={{ color: '#F5F5F5' }}>Cadastrar-se</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já possuí uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {errado && <Text style={styles.errorText}>{erro}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    height:'100%',
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
  button: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
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
});