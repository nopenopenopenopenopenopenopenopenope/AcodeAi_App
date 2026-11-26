export function limparTexto(value, max = 200) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export const apenasDigitos = (value) => String(value ?? '').replace(/\D/g, '');

export function validarNome(value) {
  const nome = limparTexto(value, 100);
  if (nome.length < 2) return 'Informe seu nome (mínimo 2 caracteres).';
  if (!/^[\p{L}\s'.-]+$/u.test(nome)) return 'O nome contém caracteres inválidos.';
  return null;
}

export function validarEmail(value) {
  const email = String(value ?? '').trim();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Informe um e-mail válido.';
  }
  return null;
}

export function validarTelefone(value) {
  let d = apenasDigitos(value);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  if (d.length < 10 || d.length > 11) return 'Informe um telefone válido com DDD.';
  return null;
}

export function validarSenha(value) {
  const s = String(value ?? '');
  if (s.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (s.length > 72) return 'A senha deve ter no máximo 72 caracteres.';
  if (!/[a-z]/.test(s)) return 'A senha precisa de uma letra minúscula.';
  if (!/[A-Z]/.test(s)) return 'A senha precisa de uma letra maiúscula.';
  if (!/\d/.test(s)) return 'A senha precisa de um número.';
  return null;
}

export function validarDataBr(value, { obrigatoria = false } = {}) {
  const v = String(value ?? '').trim();
  if (!v) return obrigatoria ? 'Informe a data (dd/mm/aaaa).' : null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v);
  if (!m) return 'Use o formato dd/mm/aaaa.';
  const [dd, mm, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(yyyy, mm - 1, dd);
  const real = d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
  if (!real) return 'Data inexistente.';
  if (yyyy < 1900) return 'Data muito antiga.';
  if (d > new Date()) return 'A data não pode ser no futuro.';
  return null;
}

export function validarInteiro(value, { min = 0, max = 1000000, rotulo = 'Valor' } = {}) {
  const s = String(value ?? '').trim();
  if (!/^\d+$/.test(s)) return `${rotulo}: use apenas números inteiros.`;
  const n = Number(s);
  if (n < min || n > max) return `${rotulo}: informe um valor entre ${min} e ${max}.`;
  return null;
}

export function validarBpm(value) {
  return validarInteiro(value, { min: 20, max: 250, rotulo: 'Batimentos' });
}

export function validarPeso(value) {
  const n = parseFloat(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 1 || n > 500) return 'Informe um peso válido (1 a 500 kg).';
  return null;
}

export function validarCodigo(value) {
  const c = String(value ?? '').trim();
  if (!/^[A-Za-z0-9-]{4,64}$/.test(c)) return 'Código inválido.';
  return null;
}

export function validarCampos(resultados) {
  return Object.fromEntries(Object.entries(resultados).filter(([, msg]) => msg));
}

export const validarPressao = (v) =>
  !v || /^\d{2,3}\/\d{2,3}$/.test(String(v).trim())
    ? null
    : 'Informe a pressão no formato 120/80.';
    export const validarTipoSanguineo = (v) =>
  /^(A|B|AB|O)[+-]$/.test(String(v ?? '').trim().toUpperCase())
    ? null
    : 'Informe um tipo sanguíneo válido (ex.: O+, AB-).';
