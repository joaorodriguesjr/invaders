export function hex(value: number, size: number = 2): string {
  return value.toString(16).padStart(size, '0')
}
