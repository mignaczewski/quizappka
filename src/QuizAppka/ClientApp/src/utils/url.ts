export function isUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}
