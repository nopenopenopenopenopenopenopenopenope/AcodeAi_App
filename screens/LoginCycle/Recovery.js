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
} from 'react-native';
import React, { useEffect } from 'react';
import { sendRecoveryCode, loginUsuario } from '../../components/storageFuncs';
import { Feather } from '@expo/vector-icons';

const prototypeHeight = Dimensions.get('window').height;
const prototypeWidth = Dimensions.get('window').width;

export default function Recovery({ navigation, route, onAuthenticated }) {
  const [email, setEmail] = React.useState('');
  const [errado, setErrado] = React.useState(false);
  const [erro, setErro] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        onAuthenticated?.(storedUser);
      }
    };

    fetchData();
  }, []);

  async function entrar() {
    setErro(null);
    setErrado(true);

    if (!email) {
      setErro('O campo deve ser preenchido para recuperar a conta');
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      return;
    }

    try {
      const error = await sendRecoveryCode(email);

      if (error) {
        setErro('Ocorreu um erro ao tentar enviar o código');
        setTimeout(() => {
          setErrado(false);
        }, 2000);
        return;
      }

      setErrado(false);
      navigation.navigate('login');
    } catch (error) {
      setErro('Erro ao acessar os dados');
      console.log(error);
      setTimeout(() => {
        setErrado(false);
      }, 2000);
      return;
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image resizeMode={'contain'} style={[styles.logotipo,{minWidth:prototypeWidth / 2,height: prototypeHeight / 7}]} source={require('../../assets/Logo.png')}/>
        <Text style={styles.textoBemVindo}>Esqueceu sua senha?</Text>
        <Text style={styles.subtextoBemVindo}>Entre seu Email para iniciar o processo de recuperação</Text>

        <View style={styles.conjuntoInputs}>
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
        </View>

        <TouchableOpacity style={styles.button} onPress={() => entrar()}>
          <Text style={{ color: '#F5F5F5' }}>Enviar o código</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginLink}>Voltar ao login</Text>
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
  forgotLink:{
    color: '#36A06F',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    alignSelf:'end'
  },
  errorText: {
    color: '#B34747',
    textAlign: 'center',
    marginTop: 16,
  },
});