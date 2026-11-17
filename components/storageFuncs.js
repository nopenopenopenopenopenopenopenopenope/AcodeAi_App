import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

/*
  Único arquivo de armazenamento do app: AsyncStorage (usuário logado),
  autenticação (supabase.auth) e todos os dados no Supabase (pacientes,
  listas do paciente, dieta, estoque).

  Chaves usadas no AsyncStorage:
  - 'user': o usuário atualmente logado (perfil + dados de sessão).

  Cadastro e login usam supabase.auth (email/senha). Dados extras
  (name, phone, foto) ficam no user_metadata do usuário de auth. A foto de
  perfil começa como a imagem padrão (userImg, base64).

  Ids no app:
   - paciente: o `codigo` de conexão (texto aleatório e único). É o que o
     usuário digita para se conectar e é o id que telas/forms usam. O
     id_paciente (bigint) fica só no banco: aqui dentro ele é traduzido
     por dbIdDoPaciente() e nunca sai deste arquivo.
   - listas (medicamentos, laudos, tarefas, ...), produtos e estoque: uuid
   - foto do paciente: data URI base64 ('data:image/jpeg;base64,...')

  Funções que falham mostram alert e retornam null (ou { success: false,
  error } nas de conectar). Os nomes de tabela seguem o dump do banco
  ("Pacientes" com P maiúsculo).
*/

// ---- Helpers ----

const pad = (n) => String(n).padStart(2, '0');

// 'dd/mm/yyyy' (ou 'd/m/yyyy') -> 'yyyy-mm-dd'. Vazio/inválido -> null.
function toIsoDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${pad(mm)}-${pad(dd)}`;
}

// 'yyyy-mm-dd' (ou timestamp ISO) -> 'dd/mm/yyyy'
function toBrDate(value) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

// Aceita array ou texto separado por vírgula e devolve sempre um array
// limpo, pois as colunas são text[].
function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

const toNumberOrNull = (value) => {
  const n = parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

// '' / undefined -> undefined (não altera) | inteiro >= 0 -> número | resto -> NaN
function toNonNegInt(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }
  const n = Number(String(value).trim().replace(',', '.'));
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

const first = (value) => (Array.isArray(value) ? value[0] : value) ?? null;

// Remove chaves undefined: num update, campo ausente = "não mexer".
const clean = (row) =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));

const formatHour = (date) => `${date.getHours()}:${pad(date.getMinutes())}`;

// Data local de hoje em 'yyyy-mm-dd' (o default do banco usa a data do
// servidor, em UTC, e viraria "amanhã" à noite no Brasil).
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fail(context, error) {
  console.error(context, error);
  Alert.alert('Erro', error?.message ?? 'Erro inesperado');
  return null;
}

// ---- Código do paciente <-> id_paciente (bigint) ----
// No app o paciente é identificado pelo `codigo`. As tabelas filhas
// (medicamentos, batimentos, dietas, ...) ainda apontam para o
// id_paciente, então o código é traduzido aqui. O mapa é preenchido pelo
// fetchPacientes; se faltar, busca no banco (a RLS só devolve pacientes
// aos quais o usuário está vinculado). Retorna null se não achar.
const pacienteDbIds = new Map();

async function dbIdDoPaciente(codigo) {
  const key = String(codigo ?? '');
  if (pacienteDbIds.has(key)) return pacienteDbIds.get(key);

  const { data, error } = await supabase
    .from('Pacientes')
    .select('id_paciente')
    .eq('codigo', key)
    .maybeSingle();

  if (error || !data) {
    return fail(
      'Paciente não encontrado',
      error ?? { message: 'Paciente não encontrado ou sem acesso.' }
    );
  }
  pacienteDbIds.set(key, data.id_paciente);
  return data.id_paciente;
}

// ---- Foto do paciente (base64) ----
const MAX_FOTO_CHARS = 500000; // ~370 KB de imagem; criar_paciente usa o mesmo limite

// Aceita só data URI de imagem. Qualquer outra coisa (ex: o placeholder
// atual dos forms) é ignorada.
function fotoDataUri(value) {
  return typeof value === 'string' && value.startsWith('data:image/') ? value : null;
}

// Valor para uma coluna foto_path (text): undefined = não mexer (sem foto ou
// valor que não é data URI), false = grande demais (já mostrou o alerta),
// string = data URI pronta para gravar.
function fotoParaBanco(value) {
  const foto = fotoDataUri(value);
  if (!foto) return undefined;
  if (foto.length > MAX_FOTO_CHARS) {
    Alert.alert('Atenção', 'A foto é muito grande. Escolha outra ou reduza o tamanho.');
    return false;
  }
  return foto;
}

// ---- Recuperação de senha ----
export async function apagarUsuario() {
  try {
    console.log('attempt')
    const { data, error } =
  await supabase.functions.invoke('smart-action');

    if (error) {
      Alert.alert('Erro', error.message);
      return null;
    }

    if (!data?.success) {
      Alert.alert('Erro', data?.error ?? 'Erro ao excluir conta.');
      return null;
    }

    await clearStoredUser();
    pacienteDbIds.clear();
    await supabase.auth.signOut();

    return true;

  } catch (error) {
    return fail('Erro ao excluir usuário', error);
  }
}
export async function sendRecoveryCode(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    Alert.alert('Erro', error.message);
    return null;
  }

  Alert.alert('E-mail enviado', 'Enviamos um e-mail com instruções para redefinir sua senha.');
  return true;
}

// ---- Usuário logado ('user') ----

export async function getStoredUser() {
  try {
    const storedData = await AsyncStorage.getItem('user');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Erro ao ler os dados do usuário', error);
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
// `name` e `phone` vão no user_metadata (options.data). Se o signUp
// falhar (ex: e-mail já cadastrado, senha fraca), retorna null e
// mostra o erro do próprio Supabase.
export async function registrarUsuario(novoUsuario) {
  const { name, email, phone, pword } = novoUsuario;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: pword,
    options: {
      // foto padrão (base64) já no cadastro; vai no user_metadata
      data: { name, phone, foto: userImg },
    },
  });

  if (signUpError) {
    Alert.alert('Erro', signUpError.message);
    return null;
  }

  const authUser = signUpData.user;

  const usuarioComId = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name ?? null,
    phone: authUser.user_metadata?.phone ?? null,
    registered: authUser.created_at,
    foto: authUser.user_metadata?.foto ?? userImg,
  };

  await setStoredUser(usuarioComId);
  return usuarioComId;
}

// ---- Login ----
// Autentica no supabase.auth e lê name/phone direto do user_metadata.
// Se der certo, já salva o resultado em 'user' (AsyncStorage).
export async function loginUsuario(email, pword) {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pword,
  });

  if (signInError) {
    Alert.alert('Erro', signInError.message);
    return null;
  }

  const authUser = signInData.user;

  const usuario = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name ?? '',
    phone: authUser.user_metadata?.phone ?? '',
    registered: authUser.created_at,
    // contas antigas não têm foto no metadata: cai no padrão
    foto: authUser.user_metadata?.foto ?? userImg,
  };

  await setStoredUser(usuario);
  return usuario;
}
// ---- Atualizar nome e foto do usuário ----

export async function atualizarUsuario({ name, foto }) {
  try {
    const usuarioAtual = await getStoredUser();

    if (!usuarioAtual) {
      Alert.alert('Erro', 'Nenhum usuário está logado.');
      return null;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: name ?? usuarioAtual.name,
        foto: foto ?? usuarioAtual.foto ?? userImg,
      },
    });

    if (error) {
      Alert.alert('Erro', error.message);
      return null;
    }

    const authUser = data.user;

    const usuarioAtualizado = {
      ...usuarioAtual,
      name: authUser.user_metadata?.name ?? usuarioAtual.name,
      foto: authUser.user_metadata?.foto ?? usuarioAtual.foto ?? userImg,
    };

    await setStoredUser(usuarioAtualizado);

    return usuarioAtualizado;

  } catch (error) {
    return fail('Erro ao atualizar usuário', error);
  }
}
// ---- Logout ----
// Limpa o 'user' do AsyncStorage ANTES de encerrar a sessão de auth: a tela
// de login (e a splash) restauram o usuário salvo ao abrir, então se o
// storage ainda tivesse o usuário (signOut é de rede e demora), o login
// automático logava de volta e era preciso sair duas vezes.
export async function logoutUsuario() {
  await clearStoredUser();
  pacienteDbIds.clear();
  await supabase.auth.signOut();
}

// ---- Pacientes ----

const PACIENTES_SELECT = `
  id_paciente_fk,
  Pacientes (
    *,
    medicamentos (*),
    laudos (*),
    tarefas (*),
    relatorios (*),
    checkins (*),
    batimentos (*),
    dietas (*),
    dieta_registros (*)
  )
`;

// Linha do banco (+ tabelas filhas) -> formato que as telas usam.
function mapPaciente(p) {
  const dieta = first(p.dietas);
  const allergies = p.Restricoes_Alimentares ?? [];

  const today = todayIso();
  const hoje = (p.dieta_registros ?? []).filter((r) => r.data === today);
  const sum = (key) => hoje.reduce((acc, r) => acc + (r[key] ?? 0), 0);

  const batimentos = [...(p.batimentos ?? [])].sort(
    (a, b) => new Date(a.medido_em) - new Date(b.medido_em)
  );
  const history = batimentos.slice(-12).map((b) => ({
    hour: formatHour(new Date(b.medido_em)),
    bpm: b.bpm,
  }));

  const diet =
    dieta || allergies.length
      ? {
          calories: { current: sum('calorias'), goal: dieta?.calorias_meta ?? 0 },
          macros: {
            carbs: { current: sum('carbo'), goal: dieta?.carbo_meta ?? 0 },
            protein: { current: sum('proteina'), goal: dieta?.proteina_meta ?? 0 },
            lipids: { current: sum('lipidios'), goal: dieta?.lipidios_meta ?? 0 },
          },
          water: { current: sum('agua_ml'), goal: dieta?.agua_meta_ml ?? 0 },
          restrictions: {
            allergies,
            intolerances: dieta?.intolerancias ?? [],
          },
        }
      : null;

  return {
    id: p.codigo, // o id do app é o código de conexão (mostre-o para compartilhar)
    name: p.Nome_paciente,
    birthDate: toBrDate(p.Data_Nascimento),
    foto: p.foto_path ?? null, // data URI base64 (coluna foto_path, text)
    conditions: p.Condicoes_Cronicas ?? [],
    bloodType: p.Tipo_Sanguineo ?? '',
    weight: p.Peso != null ? `${p.Peso} kg` : '',
    heartRate: {
      current: history.length ? history[history.length - 1].bpm : 0,
      history,
    },
    medicines: (p.medicamentos ?? []).map(LISTS.medicines.fromRow),
    laudos: (p.laudos ?? []).map(LISTS.laudos.fromRow),
    schedule: (p.tarefas ?? []).map(LISTS.schedule.fromRow),
    reports: (p.relatorios ?? []).map(LISTS.reports.fromRow),
    checkins: (p.checkins ?? []).map(LISTS.checkins.fromRow),
    diet,
  };
}

// Todos os pacientes vinculados ao usuário, já com as listas.
export async function fetchPacientes(userId) {
  const { data, error } = await supabase
    .from('usuario_paciente')
    .select(PACIENTES_SELECT)
    .eq('id_usuario_fk', userId)
    .order('criado_em');

  if (error) return fail('Erro ao carregar pacientes', error);

  const rows = (data ?? []).map((row) => row.Pacientes).filter(Boolean);
  rows.forEach((p) => pacienteDbIds.set(p.codigo, p.id_paciente));
  return rows.map(mapPaciente);
}

// output: { name, age ('dd/mm/aaaa'), conditions, restrictions, bloodType }
// Chama a RPC criar_paciente (insere o paciente e já vincula ao usuário
// logado). Retorna o `codigo` do paciente criado (é o id dele no app), ou null.
// output.foto: data URI base64 (ver components/pickPhoto.js); outro formato é ignorado.
export async function criarPaciente(output) {
  const nascimento = output.age ? toIsoDate(output.age) : null;
  if (output.age && !nascimento) {
    Alert.alert('Atenção', 'Data de nascimento inválida. Use dd/mm/aaaa.');
    return null;
  }

  const foto = fotoDataUri(output.foto);
  if (foto && foto.length > MAX_FOTO_CHARS) {
    Alert.alert('Atenção', 'A foto é muito grande. Escolha outra ou reduza o tamanho.');
    return null;
  }

  const { data, error } = await supabase.rpc('criar_paciente', {
    p_nome: output.name.trim(),
    p_nascimento: nascimento,
    p_condicoes: toArray(output.conditions),
    p_restricoes: toArray(output.restrictions),
    p_tipo_sanguineo: output.bloodType?.trim() || null,
    p_foto: foto,
  });

  if (error) return fail('Erro ao cadastrar paciente', error);
  return data; // codigo
}

// Nome/nascimento/condições/tipo sanguíneo só mudam se preenchidos;
// restrições (alergias) sempre substituem.
export async function atualizarPaciente(id, output) {
  const patch = { Restricoes_Alimentares: toArray(output.restrictions) };

  if (output.name?.trim()) patch.Nome_paciente = output.name.trim();
  if (output.age) {
    const nascimento = toIsoDate(output.age);
    if (!nascimento) {
      Alert.alert('Atenção', 'Data de nascimento inválida. Use dd/mm/aaaa.');
      return null;
    }
    patch.Data_Nascimento = nascimento;
  }
  const conditions = toArray(output.conditions);
  if (conditions.length) patch.Condicoes_Cronicas = conditions;
  if (output.bloodType?.trim()) patch.Tipo_Sanguineo = output.bloodType.trim();

  const foto = fotoDataUri(output.foto);
  if (foto) {
    if (foto.length > MAX_FOTO_CHARS) {
      Alert.alert('Atenção', 'A foto é muito grande. Escolha outra ou reduza o tamanho.');
      return null;
    }
    patch.foto_path = foto;
  }

  const { data, error } = await supabase
    .from('Pacientes')
    .update(patch)
    .eq('codigo', id)
    .select('codigo');

  if (error) return fail('Erro ao atualizar paciente', error);
  if (!data?.length) {
    return fail('Erro ao atualizar paciente', {
      message: 'Sem permissão para editar este paciente.',
    });
  }
  return true;
}

// Conecta o usuário logado a um paciente existente pelo `codigo` de convite.
// Retorna { success, id?, error? } (formato que ConnectPacientF espera).
export async function conectarPaciente(codigo) {
  const { error } = await supabase.rpc('conectar_paciente', { p_codigo: codigo });
  if (error) return { success: false, error: error.message };
  return { success: true, id: String(codigo).trim().toUpperCase() };
}

export async function salvarPeso(id, weight) {
  const peso = toNumberOrNull(weight);
  if (peso === null) {
    Alert.alert('Atenção', 'Informe um peso válido.');
    return null;
  }
  const { data, error } = await supabase
    .from('Pacientes')
    .update({ Peso: peso })
    .eq('codigo', id)
    .select('Peso')
    .single();

  if (error) return fail('Erro ao salvar peso', error);
  return `${data.Peso} kg`;
}

// Retorna { hour, bpm } no formato do histórico do app.
export async function registrarBatimento(id, bpm) {
  const dbId = await dbIdDoPaciente(id);
  if (!dbId) return null;

  const { data, error } = await supabase
    .from('batimentos')
    .insert({ id_paciente_fk: dbId, bpm })
    .select()
    .single();

  if (error) return fail('Erro ao registrar batimentos', error);
  return { hour: formatHour(new Date(data.medido_em)), bpm: data.bpm };
}

// ---- Listas do paciente (medicamentos, laudos, tarefas, relatórios, check-ins) ----
// toRow: app -> banco (undefined = não alterar). fromRow: banco -> app.
// `foto` (medicamentos) vai como data URI base64 em foto_path (text).

const LISTS = {
  medicines: {
    table: 'medicamentos',
    toRow: (e) => ({
      nome: e.name,
      inicio: e.start ? toIsoDate(e.start) : undefined,
      tratamento: e.treatment,
      frequencia: e.frequency,
      foto_path: fotoParaBanco(e.foto),
    }),
    fromRow: (r) => ({
      id: r.id,
      name: r.nome,
      start: toBrDate(r.inicio),
      treatment: r.tratamento ?? '',
      frequency: r.frequencia ?? '',
      foto: r.foto_path ?? null,
    }),
  },
  laudos: {
    table: 'laudos',
    toRow: (e) => ({
      nome: e.name,
      data: e.date ? toIsoDate(e.date) : undefined,
      medico: e.doctor,
      arquivo_path: e.file,
    }),
    fromRow: (r) => ({
      id: r.id,
      name: r.nome ?? '',
      date: toBrDate(r.data),
      doctor: r.medico ?? '',
      file: r.arquivo_path ?? null,
    }),
  },
  schedule: {
    table: 'tarefas',
    toRow: (e) => ({
      tipo: e.type ?? 'task',
      nome: e.name,
      descricao: e.desc,
      data: e.date ? toIsoDate(e.date) : undefined,
      hora: e.time,
      concluida: e.completed,
      profissional: e.professional,
      local: e.place,
      endereco: e.address,
    }),
    fromRow: (r) => ({
      id: r.id,
      type: r.tipo,
      name: r.nome,
      desc: r.descricao ?? '',
      date: toBrDate(r.data),
      time: r.hora ?? '',
      completed: !!r.concluida,
      professional: r.profissional ?? undefined,
      place: r.local ?? undefined,
      address: r.endereco ?? undefined,
    }),
  },
  reports: {
    table: 'relatorios',
    toRow: (e) => ({
      titulo: e.title,
      data: e.date ? toIsoDate(e.date) : undefined,
      corpo: e.body,
      notas: e.notes,
    }),
    fromRow: (r) => ({
      id: r.id,
      title: r.titulo ?? '',
      date: toBrDate(r.data),
      body: r.corpo ?? '',
      notes: r.notas ?? '',
    }),
  },
  checkins: {
    table: 'checkins',
    toRow: (e) => ({
      sentimento: e.feeling,
      sono: e.sleep,
      mudanca_humor: e.moodChange,
      notas: e.notes,
      data: e.date ? toIsoDate(e.date) : undefined,
    }),
    fromRow: (r) => ({
      id: r.id,
      feeling: r.sentimento ?? '',
      sleep: r.sono ?? '',
      moodChange: r.mudanca_humor ?? '',
      notes: r.notas ?? '',
      date: toBrDate(r.data),
    }),
  },
};

// Insere (existingId = null) ou atualiza (existingId = uuid) um item de
// lista do paciente. Retorna o item já no formato do app, ou null.
export async function saveListItem(field, pacienteId, entry, existingId = null) {
  const cfg = LISTS[field];
  const row = clean(cfg.toRow(entry));
  if (row.foto_path === false) return null; // foto grande demais

  // `pacienteId` é o código do paciente; as tabelas filhas usam id_paciente
  let query;
  if (existingId) {
    query = supabase.from(cfg.table).update(row).eq('id', existingId);
  } else {
    const dbId = await dbIdDoPaciente(pacienteId);
    if (!dbId) return null;
    query = supabase.from(cfg.table).insert({ ...row, id_paciente_fk: dbId });
  }

  const { data, error } = await query.select().single();
  if (error) return fail(`Erro ao salvar (${field})`, error);
  return cfg.fromRow(data);
}

export async function setTarefaConcluida(id, concluida) {
  const { error } = await supabase.from('tarefas').update({ concluida }).eq('id', id);
  if (error) return fail('Erro ao atualizar tarefa', error);
  return true;
}

// ---- Dieta ----

// metas: { calories, carbs, protein, lipids, water } — todas opcionais;
// só as preenchidas são gravadas (upsert em dietas, chave id_paciente_fk).
export async function salvarMetasDieta(pacienteId, metas) {
  const campos = {
    calorias_meta: toNonNegInt(metas.calories),
    carbo_meta: toNonNegInt(metas.carbs),
    proteina_meta: toNonNegInt(metas.protein),
    lipidios_meta: toNonNegInt(metas.lipids),
    agua_meta_ml: toNonNegInt(metas.water),
  };

  if (Object.values(campos).some(Number.isNaN)) {
    Alert.alert('Atenção', 'Use apenas números inteiros (sem letras ou vírgula).');
    return null;
  }

  const row = clean(campos);
  if (Object.keys(row).length === 0) {
    Alert.alert('Atenção', 'Preencha ao menos um campo.');
    return null;
  }

  const dbId = await dbIdDoPaciente(pacienteId);
  if (!dbId) return null;

  const { error } = await supabase
    .from('dietas')
    .upsert({ id_paciente_fk: dbId, ...row }, { onConflict: 'id_paciente_fk' });

  if (error) return fail('Erro ao salvar metas da dieta', error);
  return true;
}

// Soma `ml` de água ao consumo de hoje (uma linha nova em dieta_registros).
export async function registrarAgua(pacienteId, ml) {
  const quantidade = toNonNegInt(ml);
  if (!quantidade) {
    // undefined, 0 ou NaN
    Alert.alert('Atenção', 'Informe a quantidade de água em ml (número inteiro maior que 0).');
    return null;
  }

  const dbId = await dbIdDoPaciente(pacienteId);
  if (!dbId) return null;

  const { error } = await supabase.from('dieta_registros').insert({
    id_paciente_fk: dbId,
    data: todayIso(),
    agua_ml: quantidade,
  });

  if (error) return fail('Erro ao registrar água', error);
  return true;
}

// Registra uma refeição de hoje (uma linha nova em dieta_registros) com as
// calorias e macros informados; todos opcionais, mas ao menos um é exigido.
export async function registrarRefeicao(pacienteId, { calories, carbs, protein, lipids }) {
  const campos = {
    calorias: toNonNegInt(calories),
    carbo: toNonNegInt(carbs),
    proteina: toNonNegInt(protein),
    lipidios: toNonNegInt(lipids),
  };

  if (Object.values(campos).some(Number.isNaN)) {
    Alert.alert('Atenção', 'Use apenas números inteiros (sem letras ou vírgula).');
    return null;
  }

  const row = clean(campos);
  if (Object.keys(row).length === 0) {
    Alert.alert('Atenção', 'Preencha ao menos um campo.');
    return null;
  }

  const dbId = await dbIdDoPaciente(pacienteId);
  if (!dbId) return null;

  const { error } = await supabase.from('dieta_registros').insert({
    id_paciente_fk: dbId,
    data: todayIso(),
    ...row,
  });

  if (error) return fail('Erro ao registrar refeição', error);
  return true;
}

// Alergias ficam em Pacientes.Restricoes_Alimentares (fonte única);
// intolerâncias em dietas.intolerancias. Texto separado por vírgula ou
// array; lista vazia limpa o campo.
export async function salvarRestricoesDieta(pacienteId, { allergies, intolerances }) {
  const id = await dbIdDoPaciente(pacienteId);
  if (!id) return null;

  const { data, error } = await supabase
    .from('Pacientes')
    .update({ Restricoes_Alimentares: toArray(allergies) })
    .eq('id_paciente', id)
    .select('id_paciente');

  if (error) return fail('Erro ao salvar alergias', error);
  if (!data?.length) {
    return fail('Erro ao salvar alergias', {
      message: 'Sem permissão para editar este paciente.',
    });
  }

  const { error: dietaError } = await supabase
    .from('dietas')
    .upsert(
      { id_paciente_fk: id, intolerancias: toArray(intolerances) },
      { onConflict: 'id_paciente_fk' }
    );

  if (dietaError) return fail('Erro ao salvar intolerâncias', dietaError);
  return true;
}

// ---- Estoque ----

const mapProduto = (r) => ({
  id: r.id,
  name: r.nome,
  quantity: String(r.quantidade ?? 0),
  lastAcquisition: toBrDate(r.ultima_aquisicao),
  items: [],
  foto: r.foto_path ?? null,
});

// Lista (com 0 ou 1 item, pois o app assume um estoque por usuário).
export async function fetchEstoques(userId) {
  const { data, error } = await supabase
    .from('estoque_usuarios')
    .select('estoques ( id, nome, codigo, produtos (*), estoque_usuarios (id_usuario_fk) )')
    .eq('id_usuario_fk', userId);

  if (error) return fail('Erro ao carregar estoque', error);

  return (data ?? [])
    .map((row) => row.estoques)
    .filter(Boolean)
    .map((e) => ({
      id: e.id,
      name: e.nome ?? '',
      codigo: e.codigo ?? null,
      userIds: (e.estoque_usuarios ?? []).map((u) => u.id_usuario_fk),
      products: (e.produtos ?? []).map(mapProduto),
    }));
}

export async function saveProduto(estoqueId, entry, existingId = null) {
  const row = clean({
    nome: entry.name,
    quantidade: parseInt(entry.quantity, 10) || 0,
    ultima_aquisicao: entry.lastAcquisition ? toIsoDate(entry.lastAcquisition) : undefined,
    foto_path: fotoParaBanco(entry.foto),
  });
  if (row.foto_path === false) return null; // foto grande demais

  const query = existingId
    ? supabase.from('produtos').update(row).eq('id', existingId)
    : supabase.from('produtos').insert({ ...row, estoque_id: estoqueId });

  const { data, error } = await query.select().single();
  if (error) return fail('Erro ao salvar produto', error);
  return mapProduto(data);
}

export async function criarEstoque(nome) {
  const { data, error } = await supabase.rpc('criar_estoque', { p_nome: nome?.trim() || null });
  if (error) return fail('Erro ao criar estoque', error);
  return data; // uuid
}

// Conecta ao estoque existente pelo `codigo`. Retorna { success, id?, error? }.
export async function conectarEstoque(codigo) {
  const { data, error } = await supabase.rpc('conectar_estoque', { p_codigo: codigo });
  if (error) return { success: false, error: error.message };
  return { success: true, id: data };
}

// ---- Desconectar / remover (RPCs; ver desconectar.sql) ----
// desconectar_*: só remove o vínculo do usuário. remover_*: apaga o registro e
// os dados, mas o banco só permite se o usuário for o único conectado.
// Todas retornam true, ou null (com alert) se falharem.

export async function desconectarPaciente(codigo) {
  const { error } = await supabase.rpc('desconectar_paciente', { p_codigo: codigo });
  if (error) return fail('Erro ao desconectar paciente', error);
  pacienteDbIds.delete(String(codigo));
  return true;
}

export async function removerPaciente(codigo) {
  const { error } = await supabase.rpc('remover_paciente', { p_codigo: codigo });
  if (error) return fail('Erro ao remover paciente', error);
  pacienteDbIds.delete(String(codigo));
  return true;
}

export async function desconectarEstoque() {
  const { error } = await supabase.rpc('desconectar_estoque');
  if (error) return fail('Erro ao desconectar do estoque', error);
  return true;
}

export async function removerEstoque() {
  const { error } = await supabase.rpc('remover_estoque');
  if (error) return fail('Erro ao remover estoque', error);
  return true;
}

export async function removerMedicamento(id) {
  const { error } = await supabase.rpc('remover_medicamento', { p_id: id });
  if (error) return fail('Erro ao remover medicamento', error);
  return true;
}

// ---- Constantes ----
export const userImg =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQchi5sg7mUmbWbRUeVh1Mus0NYioqXle1nMqVk5dcUQ&s=10';