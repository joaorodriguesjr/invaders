export function hex(value: number, size: number = 2): string {
  return value.toString(16).padStart(size, '0')
}

export function repeat(callback: (iteration: number) => void, count: number) {
  for (let iteration = 0; iteration < count; iteration++) callback(iteration)
}
