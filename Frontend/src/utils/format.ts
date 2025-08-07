export function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function pad(n: number) {
  return n.toString().padStart(2, '0');
}
