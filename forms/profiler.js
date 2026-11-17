
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Image,
} from 'react-native';

import { useState } from 'react';
import { userImg } from '../components/storageFuncs';
import { pickImageFromLibrary } from '../components/imagePicker';

export default function profiler({
  style,
  closeForm,
  useOutput,
  initialData,
}) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [foto, setFoto] = useState(initialData?.foto ?? userImg);

  const pickPhoto = async () => {
    const uri = await pickImageFromLibrary();
    if (uri) setFoto(uri);
  };

  const formOutput = () => {
    useOutput({
      name: nome,
      foto: foto,
    });
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={closeForm}
        activeOpacity={1}
      >
        <TouchableOpacity style={styles.form} activeOpacity={1}>

          <Text style={styles.title}>Editar perfil</Text>

          <View style={styles.item}>
            <Image
              source={{ uri: foto }}
              style={styles.profileImage}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={pickPhoto}
            >
              <Text style={styles.buttonText}>
                Alterar foto
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.item}>
            <Text>Nome</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#B3B3B3"
              value={nome}
              onChangeText={setNome}
              autoComplete="name"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={formOutput}
          >
            <Text style={styles.buttonText}>
              Salvar alterações
            </Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 3,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
  },
  form: {
    width: '80%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#36A06F',
    textAlign: 'center',
  },
  item: {
    gap: 8,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: 8,
  },
  button: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F5F5',
  },
});
