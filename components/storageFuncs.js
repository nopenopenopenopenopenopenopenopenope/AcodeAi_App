import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

/*
  Todas as funções que mexem no AsyncStorage do app ficam centralizadas
  aqui, para não espalhar chamadas repetidas de getItem/setItem pelas
  telas.

  Chaves usadas no AsyncStorage:
  - 'user': o usuário atualmente logado (perfil + dados de sessão).

  Cadastro e login agora usam supabase.auth (email/senha) em vez da
  lista local 'usuarios'. Por isso 'usuarios', generateUuid,
  getUsuarios/saveUsuarios/usuarioEmailExiste foram removidos daqui —
  o próprio Supabase já garante e-mail único e gera o id (uuid) do
  usuário. Dados extras (name, phone) ficam salvos direto no
  user_metadata do próprio usuário de auth (options.data no signUp) —
  não precisa de nenhuma tabela própria pra isso.

  Este arquivo também exporta os dados iniciais (mock/seed) de profile,
  pacient e stock usados pelo App.js — ver seção "Dados iniciais (mock)"
  no fim do arquivo. Todo item de lista (medicamento, laudo, tarefa,
  relatório, check-in, produto do estoque) tem um `id` estável — é o que
  App.js usa para decidir se um formOutput deve substituir um item
  existente (edição) ou virar um item novo (adição).
*/

// ---- Recuperação de senha ----

export async function sendRecoveryCode(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    alert(error.message);
    return null;
  }

  alert('Enviamos um e-mail com instruções para redefinir sua senha.');
  return true;
}

// ---- Usuário logado ('user') ----

export async function getStoredUser() {
  try {
    const storedData = await AsyncStorage.getItem('user');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Erro ao lêr os dados do usuário', error);
    return null;
  }
}

export async function setStoredUser(usuario) {
  await AsyncStorage.setItem('user', JSON.stringify(usuario));
  return usuario;
}

export async function clearStoredUser() {
  await AsyncStorage.removeItem('user');
}

// ---- Cadastro ----
// novoUsuario: { name, email, phone, pword }
// Cria o usuário direto no supabase.auth — sem nenhuma tabela própria.
// `name` e `phone` vão no user_metadata (options.data), que o próprio
// Supabase já guarda e devolve em toda resposta de auth. Se o signUp
// falhar (ex: e-mail já cadastrado, senha fraca), retorna null e
// mostra o erro do próprio Supabase.
export async function registrarUsuario(novoUsuario) {
  const { name, email, phone, pword } = novoUsuario;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pword,
    options: {
      data: { name, phone },
    },
  });

  console.log('signUp retornou user:', signUpData?.user);

  if (signUpError) {
    alert(signUpError.message);
    return null;
  }

  const authUser = signUpData.user;

  const usuarioComId = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name ?? null,
    phone: authUser.user_metadata?.phone ?? null,
    registered: authUser.created_at,
  };

  await setStoredUser(usuarioComId);
  return usuarioComId;
}

// cadastrar pacientes

export async function registrarPaciente(paciente) {

  console.log('Paciente enviado para Supabase:', paciente);

  const { error } = await supabase
    .from('Pacientes')
    .insert({
      Nome_paciente: paciente.name,
      Condicoes_Cronicas: paciente.doencas,
      Restricoes_Alimentares: paciente.restrictions,
      Data_Nascimento: paciente.birthDate || null
    })

if (error) {
  console.error("Erro: ", error)
  return false
}
return true;
}
// ---- Login ----
// Autentica no supabase.auth e lê name/phone direto do user_metadata
// (sem consultar nenhuma tabela). Se der certo, já salva o resultado
// em 'user' (AsyncStorage), igual antes.
export async function loginUsuario(email, pword) {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pword,
  });

  if (signInError) {
    alert(signInError.message);
    return null;
  }

  const authUser = signInData.user;

  const usuario = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name ?? '',
    phone: authUser.user_metadata?.phone ?? '',
    registered: authUser.created_at,
  };

  await setStoredUser(usuario);
  return usuario;
}

// ---- Logout ----
// Não existia antes (o app só dava clearStoredUser), mas com Supabase
// é preciso encerrar a sessão de auth também, senão o token continua
// válido.
export async function logoutUsuario() {
  await supabase.auth.signOut();
  await clearStoredUser();
}

// ---- Dados iniciais (mock) ----
// Estado inicial de profile/pacient/stock usado pelo App.js. Não é lido
// do AsyncStorage — é só o seed de demonstração do protótipo, movido
// para cá para não inflar o App.js.

export const userImg =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJoAAACUCAMAAABcK8BVAAAAP1BMVEX///+ZmZmVlZXa2tqSkpLT09P7+/uvr6+Pj4+cnJypqan4+Pijo6Ps7Ozo6Ojf39/ExMS2tra9vb3Nzc3y8vJNRIxZAAAFOElEQVR4nO1c6XLzKgyNMV4w3s37P+tnJ2kTL/hIgN17Zzg/OtNOQw+SQCt9PCIiIiIiIiIiIiIi/lfQpsv6oaieKIY+64zO/5rU49GmfaFkKaUQyRNCyPnbpOrT9k95jZUSP5zWmH+qqvFv2OVdn5SHrL74VmVKMlUZk1CTh8CtVzDBmYFhKCcQSpQmZ+ozM3RgAAAAAAAABMBWMU0AjRrKIuySG62aBkyYlPaz43CKKhJwEGB88AKzOAMzqfeOT5cl1peYmVVDLPSdGQqpVrJQ4zUUYKb2C2ucms5nmLSCPV88BMFNvWFzNPQVEp6rgvWEL26HOiX4ud8FeAkCg9p8Fna+tEFJwU3UElGO7Ze3ydsRtZfXH+eVAVnUltZYMbWvO6CdCsUr/V5LbYYsS/nzlQcuNRmqg0GgdqWtCbkBuRTuQI18K4lS1kM/ZStM/VBL+lHg3WsdjVeixtQyo6PTsSa2nHnUSD5UFumpZzYpqU3DdFSEfENUePAlbwkpBjfdQxUBoYhHPoPl5oqZHIAC1oFzssEgwXELWefumZc8nq/FbqWlZ3EgN6095YardBvo0n5G+W25s3y0ZHc27MxcynXjyU75i9mM160FbA3gHHouqVUHTq0lbdUBvwjeWC5dpjP+hS1gsLXfznCcJLs3bywqdZleOD5VqMxhx3EuL12a8IdlLJ+O16HY2CWsJ47qAj59wqMmpOM0ykEzVOCitx1HNWeHSu6Cg34EauWd46DR5zpelO2X8prO2E+MOB2CBfueIbskvF5v76yc19rdH54jVNur0llo+wKgQ41/hW1w5DNOsfEuzk3fn+XW1Fx93gvr4JldR99gU/H3m0xct0tKz1npZkXN3ee9sKqvS19q3wr1H6/7Vqk/tc/1EWDQtLmKWoBB+i+fID3Hy82HGrOoZsFnGktMqRc+TtR/sO4J/WVuwg8fQws0NUyozfAgqmAPDxoZdprZ12ZX3IJWdplNKYCW1Qk4h+8VtOOGR21pEGFltgBPjNKYqQue3pgQ8/OMkiEH+Ujsvdoh+6ueUqV+ShXqwkePjY9SL34al2euL+OEyK5+UGhGVgPql9l4xxvRrmIfh7K66EXcnlzBkZwQxV3EHssb6YLakpVlcfdLadNX+ESIpOpve4f8Bd31qrSHS0Iuj3FCP9Cjw0xDrbYPqJZ4VtXDfe+2bdBNmo1Dpd5d7oXUmKXN34lrizzX2hijtc7/A//5ISIiIiIiIiIiIiKCi3/HUDjyBUAomQAAAABJRU5ErkJggg=='

// Placeholders para os campos de foto dos formulários (PacientF, MedicineF,
// DeviceF, StockF), enquanto não há um seletor de imagem de verdade — um
// ícone diferente por formulário, pra pelo menos dar um retorno visual
// quando "Escolher Foto/Imagem" é tocado.
export const initialProfile = {
  id: 'reginaldo',
  pacientIds: ['bertha', 'berthad'],
  pacientsLimit: 3,
  selectedPacient: 'bertha',
  stockId: 'estoque1',
  name: 'Reginaldo Alves',
  role: 'Cuidador',
  email: 'alvesreg@exemploemail.com',
  phone: '(00) 9 000-0000',
  senha: '123456',
  foto: userImg,
};

export const initialPacients = [
  {
    id: 'berthad',
    name: 'Stella Nicolau',
    birthDate: '12/04/2019',
    foto: null,
    conditions: ['Alzheimer', 'Parkinson', 'Hipertensão'],
    emergencyContacts: [
      { relation: 'Filho', name: 'Carlos G. Olga', phone: '(00) 0-0000-0000', whatsapp: '5500900000000' },
      { relation: 'Filha', name: 'Ana G. Olga', phone: '(00) 0-0000-0000', whatsapp: '5500900000000' },
    ],
    heartRate: {
      current: 0,
      history: [
        { hour: 11, bpm: 78 },
        { hour: 12, bpm: 82 },
        { hour: 13, bpm: 88 },
        { hour: 14, bpm: 0 },
      ],
    },
    bloodType: 'C-',
    weight: '68 kg',
    medicines: [
      {
        id: 'medicine_berthad_1',
        name: 'Cloridrato de Donepezila',
        start: '02/08/2026',
        treatment: 'Doença de Alzheimer',
        frequency: '2 vezes ao dia',
        foto: null,
      },
      {
        id: 'medicine_berthad_2',
        name: 'Levodopa',
        start: '02/08/2026',
        treatment: 'Doença de Parkinson',
        frequency: '2 vezes ao dia',
        foto: null,
      },
      {
        id: 'medicine_berthad_3',
        name: 'Metformina',
        start: '26/07/2026',
        treatment: 'Diabetes tipo 2',
        frequency: '2 vezes ao dia',
        foto: null,
      },
      {
        id: 'medicine_berthad_4',
        name: 'Dipirona',
        start: '09/08/2026',
        treatment: 'Dor nos ossos',
        frequency: '2 vezes ao dia',
        foto: null,
      },
    ],
    laudos: [
      { id: 'laudo_berthad_1', name: 'Hemograma completo', date: '02/07/2026', doctor: 'Dra. Fernanda Lima', file: 'https://example.com/laudos/hemograma.pdf' },
      { id: 'laudo_berthad_2', name: 'Eletrocardiograma', date: '18/06/2026', doctor: 'Dr. Ricardo Souza', file: 'https://example.com/laudos/ecg.pdf' },
    ],
    schedule: [],
    reports: [],
    checkins: [],
    devices: [],
    diet: null,
  }, {
    id: 'bertha',
    name: 'Samantha Silveira',
    birthDate: '12/04/1952',
    foto: null,
    conditions: ['Alzheimer', 'Parkinson', 'Hipertensão'],
    emergencyContacts: [
      { relation: 'Filho', name: 'Carlos G. Olga', phone: '(00) 0-0000-0000', whatsapp: '5500900000000' },
      { relation: 'Filha', name: 'Ana G. Olga', phone: '(00) 0-0000-0000', whatsapp: '5500900000000' },
    ],
    heartRate: {
      current: 96,
      history: [
        { hour: 11, bpm: 78 },
        { hour: 6, bpm: 82 },
        { hour: 3, bpm: 88 },
        { hour: 1, bpm: 96 },
      ],
    },
    bloodType: 'A+',
    weight: '68 kg',
    medicines: [
      {
        id: 'medicine_bertha_1',
        name: 'Cloridrato de Donepezila',
        start: '02/08/2026',
        treatment: 'Doença de Alzheimer',
        frequency: '2 vezes ao dia',
        foto: null,
      },
      {
        id: 'medicine_bertha_2',
        name: 'Levodopa',
        start: '02/08/2026',
        treatment: 'Doença de Parkinson',
        frequency: '2 vezes ao dia',
        foto: null,
      },
      {
        id: 'medicine_bertha_3',
        name: 'Metformina',
        start: '26/07/2026',
        treatment: 'Diabetes tipo 2',
        frequency: '2 vezes ao dia',
        foto: null,
      },
      {
        id: 'medicine_bertha_4',
        name: 'Dipirona',
        start: '09/08/2026',
        treatment: 'Dor nos ossos',
        frequency: '2 vezes ao dia',
        foto: null,
      },
    ],
    laudos: [
      { id: 'laudo_bertha_1', name: 'Hemograma completo', date: '02/07/2026', doctor: 'Dra. Fernanda Lima', file: 'https://example.com/laudos/hemograma.pdf' },
      { id: 'laudo_bertha_2', name: 'Eletrocardiograma', date: '18/06/2026', doctor: 'Dr. Ricardo Souza', file: 'https://example.com/laudos/ecg.pdf' },
    ],
    schedule: [
      { id: 'task_bertha_1', name: 'Remédio: Levedopa', desc: 'Ministrar o remédio para parkinson', time: '6h30', date: '18/08/2026', completed: true, type: 'task' },
      { id: 'task_bertha_2', name: 'Remédio: Donepezila', desc: 'Ministrar o remédio para alzheimer', time: '6h30', date: '18/08/2026', completed: false, type: 'task' },
      { id: 'task_bertha_3', name: 'Remédio: Metformina', desc: 'Ministrar o remédio para diabetes tipo 2', time: '9h30', date: '18/08/2026', completed: false, type: 'task' },
      { id: 'task_bertha_4', name: 'Caminhada', desc: 'Caminhar com Samantha por 30 minutos', time: '10h20', date: '18/08/2026', completed: false, type: 'task' },
      { id: 'task_bertha_5', name: 'Remédio: Losartana', desc: 'Ministrar o remédio para hipertensão', time: '12h20', date: '18/08/2026', completed: false, type: 'task' },
      {
        id: 'event_bertha_1',
        name: 'Consulta geriátrica',
        time: '9:30 AM',
        date: '12/10/2026',
        completed: false,
        type: 'event',
        professional: 'Dra. Carla Vespolli',
        place: 'Hospital das Clínicas da UFMG',
        address: 'Av. Prof. Alfredo Balena, 110 - Santa Efigênia',
      },
      {
        id: 'event_bertha_2',
        name: 'Exame de sangue',
        time: '11:30 AM',
        date: '16/10/2026',
        completed: false,
        type: 'event',
        professional: 'Enf. Maristela Silva',
        place: 'Hospital das Clínicas da UFMG',
        address: 'Av. Prof. Alfredo Balena, 110 - Santa Efigênia',
      },
    ],
    reports: [
      {
        id: 'report_bertha_1',
        title: 'Recuperação no estado de gripe',
        date: '12/06/2026',
        body: '',
        notes: 'redução do estresse do paciente.',
      },
    ],
    checkins: [
      {
        id: 'checkin_bertha_1',
        feeling: 'Fadiga relatada',
        sleep: '',
        moodChange: 'Alteração de humor relatada.',
        notes: '',
        date: '12/06/2026',
      },
      {
        id: 'checkin_bertha_2',
        feeling: 'Fadiga relatada',
        sleep: '',
        moodChange: 'Alteração de humor relatada.',
        notes: '',
        date: '12/06/2026',
      },
    ],
    devices: [],
    diet: {
      calories: { current: 1690, goal: 2600 },
      macros: {
        carbs: { current: 70, goal: 100 },
        protein: { current: 41, goal: 75 },
        lipids: { current: 34, goal: 40 },
      },
      water: { current: 1200, goal: 2000 },
      restrictions: {
        allergies: ['Amendoim', 'Castanhas e nozes', 'Leite e derivados', 'Ovos', 'Frutos do mar'],
        intolerances: ['Intolerância à lactose', 'Intolerância ao glúten'],
      },
    },
  },
];

// Estoque: um usuário só pode ter um estoque (profile.stockId), mas um
// estoque pode ter vários usuários (stock.userIds).
export const initialStock = [
  {
    id: 'estoque1',
    userIds: ['reginaldo'],
    products: [
      {
        id: 'product_estoque1_1',
        name: 'Cloridrato de Donepezila',
        quantity: '16',
        lastAcquisition: '02/07/2026',
        items: [],
        foto: null,
      },
      {
        id: 'product_estoque1_2',
        name: 'Seringas',
        quantity: '68',
        lastAcquisition: '13/07/2026',
        items: [],
        foto: null,
      },
    ],
  },
];