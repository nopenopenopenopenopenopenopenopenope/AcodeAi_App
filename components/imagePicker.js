import * as ImagePicker from 'expo-image-picker';

/*
  Abre a galeria de fotos do dispositivo e devolve a imagem escolhida como
  data URI base64 ('data:image/jpeg;base64,...'), que é o formato gravado
  nas colunas foto_path (text) do banco — ou null se o usuário cancelar, ou a
  permissão de acesso à galeria for negada. Os forms usam esse null pra saber
  que não devem sobrescrever o que já estava lá (foto atual, se estiver
  editando; nada, se for novo).

  Qualidade baixa + recorte quadrado para a string caber no limite de
  tamanho (MAX_FOTO_CHARS em storageFuncs.js).
*/
export async function pickImageFromLibrary() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.3,
    base64: true,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset.base64) return null;
  return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
}