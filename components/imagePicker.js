import * as ImagePicker from 'expo-image-picker';

/*
  Abre a galeria de fotos do dispositivo e devolve o uri da imagem
  escolhida — ou null se o usuário cancelar, ou a permissão de acesso à
  galeria for negada. Os forms usam esse null pra saber que não devem
  sobrescrever o que já estava lá (foto atual, se estiver editando; nada,
  se for novo — nesse caso o formOutput cai no placeholder do form).
*/
export async function pickImageFromLibrary() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  return result.assets[0].uri;
}