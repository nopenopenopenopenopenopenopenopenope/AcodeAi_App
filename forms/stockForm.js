import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';

import { useState } from 'react';
//Unfinished

import { stockPlaceholderImg } from '../components/storageFuncs';
import { pickImageFromLibrary } from '../components/imagePicker';
import DateField from '../components/DateField';

export default function StockF({ style, closeForm, useOutput, initialData }) {
  const [nome, setNome] = useState(initialData?.name ?? '');
  const [quantidade, setQuantidade] = useState(initialData?.quantity ?? '');
  const [ultimaAquisicao, setUltimaAquisicao] = useState(initialData?.lastAcquisition ?? '');
  const [itemNome, setItemNome] = useState('');
  const [itemQuantidade, setItemQuantidade] = useState('');
  const [itens, setItens] = useState(initialData?.items ?? []);
  const [foto, setFoto] = useState(initialData?.foto ?? '');

  const adicionarItem = () => {
    if (!itemNome && !itemQuantidade) return;
    setItens([...itens, { name: itemNome, quantity: itemQuantidade }]);
    setItemNome('');
    setItemQuantidade('');
  };

  const pickPhoto = async () => {
    const uri = await pickImageFromLibrary();
    if (uri) setFoto(uri);
  };

  const formOutput = () => {
    const output = {
      name: nome,
      quantity: quantidade,
      lastAcquisition: ultimaAquisicao,
      items: itens,
      foto: foto ,
    };

    useOutput(output);
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <TouchableOpacity style={[styles.container, style]} onPress={closeForm}>
        <TouchableOpacity style={styles.form} activeOpacity={1}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.item}>
              <Text>Nome do(s) produto(s) estocado(s)</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#B3B3B3"
                value={String(nome)}
                onChangeText={(text) => {
                  setNome(text);
                }}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <Text>Quantidade</Text>
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#B3B3B3"
                value={String(quantidade)}
                onChangeText={(text) => {
                  setQuantidade(text);
                }}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <DateField
                value={ultimaAquisicao}
                onChange={setUltimaAquisicao}
                mode="date"
                placeholder="Escolher Data da Última Aquisição"
              />
            </View>

            <View style={styles.item}>
              <Text>Lista de itens (opcional)</Text>
              <TextInput
                keyboardType="default"
                style={styles.input}
                placeholder="Nome do item"
                placeholderTextColor="#B3B3B3"
                value={String(itemNome)}
                onChangeText={(text) => {
                  setItemNome(text);
                }}
                autoComplete="none"
              />
            </View>

            <View style={styles.item}>
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                placeholder="Quantidade do total"
                placeholderTextColor="#B3B3B3"
                value={String(itemQuantidade)}
                onChangeText={(text) => {
                  setItemQuantidade(text);
                }}
                autoComplete="none"
              />
            </View>

            {itens.map((it, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemRowText}>
                  {it.name} {it.quantity ? `- ${it.quantity}` : ''}
                </Text>
              </View>
            ))}

            <View style={styles.item}>
              <TouchableOpacity style={styles.button} onPress={adicionarItem}>
                <Text style={{ color: '#F5F5F5' }}>Adicionar item</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.item}>
              <Text>Foto da capa</Text>
              <TouchableOpacity style={styles.button} onPress={pickPhoto}>
                <Text style={{ color: '#F5F5F5' }}>
                  {foto ? 'Imagem selecionada' : 'Procurar'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.item}>
              <TouchableOpacity style={styles.button} onPress={formOutput}>
                <Text style={{ color: '#F5F5F5' }}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 3,
  },
  button: {
    backgroundColor: '#36A06F',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  item: {
    gap: 8,
    marginBottom: 8,
  },
  itemRow: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  itemRowText: {
    color: '#4D4D4D',
  },
  form: {
    width: '80%',
    maxHeight: '80%',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 8,
  },
});