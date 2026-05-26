export function formatMoney(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}