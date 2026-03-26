export function sanitizeCpf(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "").slice(0, 11);
}

export function isValidCpf(value: string | null | undefined) {
  const cpf = sanitizeCpf(value);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }

  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }

  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;

  return digit === Number(cpf[10]);
}
