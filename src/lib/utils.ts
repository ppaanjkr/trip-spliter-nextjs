export function createId(prefix: string) {
  return `${prefix}${Date.now()}`;
}

export function nowISO() {
  return new Date().toISOString();
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}