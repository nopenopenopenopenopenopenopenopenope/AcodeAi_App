import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import {
  limparTexto,
  validarNome,
  validarEmail,
  validarTelefone,
  validarSenha,
  validarDataBr,
  validarBpm,
  validarPeso,
  validarCodigo,
} from './validacao';

/*
  Único arquivo de armazenamento do app: AsyncStorage (usuário logado),
  autenticação (supabase.auth) e todos os dados no Supabase (pacientes,
  listas do paciente, dieta, estoque).

  Chaves usadas no AsyncStorage:
  - 'user': o usuário atualmente logado (perfil + dados de sessão).

  Cadastro e login usam supabase.auth (email/senha). Dados extras
  (name, phone, foto) ficam no user_metadata do usuário de auth. A foto de
  perfil começa como a imagem padrão (userImg).

  Ids no app:
   - paciente: o `codigo` de conexão (texto aleatório e único). O
     id_paciente (bigint) fica só no banco: aqui dentro ele é traduzido
     por dbIdDoPaciente() e nunca sai deste arquivo.
   - listas (medicamentos, laudos, tarefas, ...), produtos e estoque: uuid
   - foto: data URI base64 ('data:image/jpeg;base64,...')

  [SEGURANÇA] Mudanças desta versão (procure por "[SEGURANÇA]"):
   1. Mensagens de erro genéricas (sem vazar mensagem do Supabase/banco).
   2. Política de senha + validação de entradas no cadastro.
   3. Consentimento (aceite dos termos) registrado no cadastro.
   4. Tipos de imagem permitidos (jpeg/png/webp) — SVG e outros são recusados.
   5. Logs de erro detalhados só em desenvolvimento (__DEV__).
*/

// ---- Helpers ----

const pad = (n) => String(n).padStart(2, '0');

function toIsoDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${pad(mm)}-${pad(dd)}`;
}

function toBrDate(value) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function toArray(value) {
  if (Array.isArray(value)) return value.map((i) => limparTexto(i, 100)).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => limparTexto(item, 100)).filter(Boolean);
  }
  return [];
}

const toNumberOrNull = (value) => {
  const n = parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

function toNonNegInt(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }
  const n = Number(String(value).trim().replace(',', '.'));
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

const first = (value) => (Array.isArray(value) ? value[0] : value) ?? null;

const clean = (row) =>
  Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));

const formatHour = (date) => `${date.getHours()}:${pad(date.getMinutes())}`;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// [SEGURANÇA] O detalhe técnico do erro (nome de tabela, constraint, etc.)
// só vai para o log em desenvolvimento. O usuário vê uma mensagem genérica.
function fail(context, error) {
  if (__DEV__) console.error(context, error);
  Alert.alert('Erro', 'Não foi possível concluir a operação. Tente novamente.');
  return null;
}

// ---- Código do paciente <-> id_paciente (bigint) ----
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

// ---- Foto (base64) ----
const MAX_FOTO_CHARS = 500000; // ~370 KB de imagem; criar_paciente usa o mesmo limite

// [SEGURANÇA] Só aceita data URI de imagem raster permitida (sem SVG, que
// pode conter script). Qualquer outra coisa é ignorada.
const TIPOS_IMAGEM_OK = ['image/jpeg', 'image/png', 'image/webp'];

function fotoDataUri(value) {
  if (typeof value !== 'string') return null;
  const m = /^data:(image\/[a-z+.-]+);base64,/i.exec(value);
  return m && TIPOS_IMAGEM_OK.includes(m[1].toLowerCase()) ? value : null;
}

function fotoParaBanco(value) {
  const foto = fotoDataUri(value);
  if (!foto) return undefined;
  if (foto.length > MAX_FOTO_CHARS) {
    Alert.alert('Atenção', 'A foto é muito grande. Escolha outra ou reduza o tamanho.');
    return false;
  }
  return foto;
}

// ---- Exclusão de conta / recuperação de senha ----
export async function apagarUsuario() {
  try {
    const { data, error } = await supabase.functions.invoke('smart-action');

    if (error || !data?.success) {
      return fail('Erro ao excluir conta', error ?? { message: data?.error });
    }

    await clearStoredUser();
    pacienteDbIds.clear();
    await supabase.auth.signOut();

    return true;
  } catch (error) {
    return fail('Erro ao excluir usuário', error);
  }
}

// [SEGURANÇA] Resposta sempre igual, exista o e-mail ou não (evita
// enumeração de usuários).
export async function sendRecoveryCode(email) {
  const erroEmail = validarEmail(email);
  if (erroEmail) {
    Alert.alert('Atenção', erroEmail);
    return null;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(String(email).trim());
  if (error && __DEV__) console.error('Erro na recuperação de senha', error);

  Alert.alert(
    'Verifique seu e-mail',
    'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.'
  );
  return true;
}

// ---- Usuário logado ('user') ----

export async function getStoredUser() {
  try {
    const storedData = await AsyncStorage.getItem('user');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    if (__DEV__) console.error('Erro ao ler os dados do usuário', error);
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
// novoUsuario: { name, email, phone, pword, aceitouTermos }
// [SEGURANÇA] Valida entradas, exige o aceite dos termos e registra a data
// do consentimento no user_metadata.
export async function registrarUsuario(novoUsuario) {
  const { email, pword, aceitouTermos } = novoUsuario;
  const name = limparTexto(novoUsuario.name, 100);
  const phone = String(novoUsuario.phone ?? '').trim();

  const erro =
    validarNome(name) ||
    validarEmail(email) ||
    validarTelefone(phone) ||
    validarSenha(pword);
  if (erro) {
    Alert.alert('Atenção', erro);
    return null;
  }

  if (!aceitouTermos) {
    Alert.alert('Atenção', 'Aceite os Termos de Uso e a Política de Privacidade para continuar.');
    return null;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: String(email).trim(),
    password: pword,
    options: {
      data: {
        name,
        phone,
        foto: userImg,
        consentimento_em: new Date().toISOString(),
      },
    },
  });

  if (signUpError) {
    if (__DEV__) console.error('Erro no cadastro', signUpError);
    Alert.alert(
      'Erro',
      'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.'
    );
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
// [SEGURANÇA] Mensagem genérica: não diz se o e-mail existe ou se a senha
// está errada.
export async function loginUsuario(email, pword) {
  if (!email || !pword) {
    Alert.alert('Atenção', 'Informe e-mail e senha.');
    return null;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: pword,
  });

  if (signInError) {
    if (__DEV__) console.error('Erro no login', signInError);
    Alert.alert('Erro', 'E-mail ou senha incorretos.');
    return null;
  }

  const authUser = signInData.user;

  const usuario = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata?.name ?? '',
    phone: authUser.user_metadata?.phone ?? '',
    registered: authUser.created_at,
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

    if (name !== undefined && name !== null) {
      const erroNome = validarNome(name);
      if (erroNome) {
        Alert.alert('Atenção', erroNome);
        return null;
      }
    }

    // [SEGURANÇA] foto nova só se for data URI permitido e de tamanho aceitável;
    // caso contrário mantém a atual.
    const fotoNova = foto != null ? fotoParaBanco(foto) : undefined;
    if (fotoNova === false) return null;

    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: name != null ? limparTexto(name, 100) : usuarioAtual.name,
        foto: fotoNova ?? usuarioAtual.foto ?? userImg,
      },
    });

    if (error) return fail('Erro ao atualizar usuário', error);

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
    id: p.codigo,
    name: p.Nome_paciente,
    birthDate: toBrDate(p.Data_Nascimento),
    foto: p.foto_path ?? null,
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

// NOTA: a RLS do banco deve filtrar por auth.uid(); o userId enviado pelo
// cliente aqui é só um filtro de conveniência e NÃO deve ser confiado.
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

// output: { name, age ('dd/mm/aaaa'), conditions, restrictions, bloodType, foto }
export async function criarPaciente(output) {
  const nome = limparTexto(output.name, 100);
  const erro = validarNome(nome) || validarDataBr(output.age);
  if (erro) {
    Alert.alert('Atenção', erro);
    return null;
  }
  const nascimento = output.age ? toIsoDate(output.age) : null;

  const foto = fotoDataUri(output.foto);
  if (foto && foto.length > MAX_FOTO_CHARS) {
    Alert.alert('Atenção', 'A foto é muito grande. Escolha outra ou reduza o tamanho.');
    return null;
  }

  const { data, error } = await supabase.rpc('criar_paciente', {
    p_nome: nome,
    p_nascimento: nascimento,
    p_condicoes: toArray(output.conditions),
    p_restricoes: toArray(output.restrictions),
    p_tipo_sanguineo: limparTexto(output.bloodType, 10) || null,
    p_foto: foto,
  });

  if (error) return fail('Erro ao cadastrar paciente', error);
  return data; // codigo
}

export async function atualizarPaciente(id, output) {
  const patch = { Restricoes_Alimentares: toArray(output.restrictions) };

  if (output.name?.trim()) {
    const erroNome = validarNome(output.name);
    if (erroNome) {
      Alert.alert('Atenção', erroNome);
      return null;
    }
    patch.Nome_paciente = limparTexto(output.name, 100);
  }
  if (output.age) {
    const erroData = validarDataBr(output.age);
    if (erroData) {
      Alert.alert('Atenção', erroData);
      return null;
    }
    patch.Data_Nascimento = toIsoDate(output.age);
  }
  const conditions = toArray(output.conditions);
  if (conditions.length) patch.Condicoes_Cronicas = conditions;
  if (output.bloodType?.trim()) patch.Tipo_Sanguineo = limparTexto(output.bloodType, 10);

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

// [SEGURANÇA] Mensagem genérica para código inválido/sem acesso. O banco
// (RPC) deve limitar tentativas para dificultar adivinhação de códigos.
export async function conectarPaciente(codigo) {
  const erro = validarCodigo(codigo);
  if (erro) return { success: false, error: erro };

  const { error } = await supabase.rpc('conectar_paciente', { p_codigo: String(codigo).trim() });
  if (error) {
    if (__DEV__) console.error('Erro ao conectar paciente', error);
    return { success: false, error: 'Código inválido ou sem acesso.' };
  }
  return { success: true, id: String(codigo).trim().toUpperCase() };
}

export async function salvarPeso(id, weight) {
  const erro = validarPeso(weight);
  if (erro) {
    Alert.alert('Atenção', erro);
    return null;
  }
  const peso = toNumberOrNull(weight);
  const { data, error } = await supabase
    .from('Pacientes')
    .update({ Peso: peso })
    .eq('codigo', id)
    .select('Peso')
    .single();

  if (error) return fail('Erro ao salvar peso', error);
  return `${data.Peso} kg`;
}

export async function registrarBatimento(id, bpm) {
  const erro = validarBpm(bpm);
  if (erro) {
    Alert.alert('Atenção', erro);
    return null;
  }

  const dbId = await dbIdDoPaciente(id);
  if (!dbId) return null;

  const { data, error } = await supabase
    .from('batimentos')
    .insert({ id_paciente_fk: dbId, bpm: Number(bpm) })
    .select()
    .single();

  if (error) return fail('Erro ao registrar batimentos', error);
  return { hour: formatHour(new Date(data.medido_em)), bpm: data.bpm };
}

// ---- Listas do paciente ----

const LISTS = {
  medicines: {
    table: 'medicamentos',
    toRow: (e) => ({
      nome: limparTexto(e.name, 100),
      inicio: e.start ? toIsoDate(e.start) : undefined,
      tratamento: e.treatment != null ? limparTexto(e.treatment, 300) : undefined,
      frequencia: e.frequency != null ? limparTexto(e.frequency, 100) : undefined,
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
      nome: limparTexto(e.name, 150),
      data: e.date ? toIsoDate(e.date) : undefined,
      medico: e.doctor != null ? limparTexto(e.doctor, 100) : undefined,
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
      nome: limparTexto(e.name, 150),
      descricao: e.desc != null ? limparTexto(e.desc, 500) : undefined,
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
      titulo: limparTexto(e.title, 150),
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

export async function saveListItem(field, pacienteId, entry, existingId = null) {
  const cfg = LISTS[field];
  if (!cfg) return fail(`Lista inválida (${field})`, { message: 'Lista inválida' });

  const row = clean(cfg.toRow(entry));
  if (row.foto_path === false) return null; // foto grande demais

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

export async function registrarAgua(pacienteId, ml) {
  const quantidade = toNonNegInt(ml);
  if (!quantidade) {
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
  const quantidade = parseInt(entry.quantity, 10) || 0;
  if (quantidade < 0 || quantidade > 100000) {
    Alert.alert('Atenção', 'Informe uma quantidade válida.');
    return null;
  }

  const row = clean({
    nome: limparTexto(entry.name, 100),
    quantidade,
    ultima_aquisicao: entry.lastAcquisition ? toIsoDate(entry.lastAcquisition) : undefined,
    foto_path: fotoParaBanco(entry.foto),
  });
  if (row.foto_path === false) return null;

  const query = existingId
    ? supabase.from('produtos').update(row).eq('id', existingId)
    : supabase.from('produtos').insert({ ...row, estoque_id: estoqueId });

  const { data, error } = await query.select().single();
  if (error) return fail('Erro ao salvar produto', error);
  return mapProduto(data);
}

export async function criarEstoque() {
  const numeroAleatorio = String(Math.floor(Math.random() * 90000) + 10000);
  const { data, error } = await supabase.rpc('criar_estoque', {
    p_nome: numeroAleatorio,
  });
  if (error) return fail('Erro ao criar estoque', error);
  return data; // uuid
}

export async function conectarEstoque(codigo) {
  const erro = validarCodigo(codigo);
  if (erro) return { success: false, error: erro };

  const { data, error } = await supabase.rpc('conectar_estoque', { p_codigo: String(codigo).trim() });
  if (error) {
    if (__DEV__) console.error('Erro ao conectar estoque', error);
    return { success: false, error: 'Código inválido ou sem acesso.' };
  }
  return { success: true, id: data };
}

// ---- Desconectar / remover (RPCs) ----

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