import { Processor } from './machine'
import rom from './rom/invaders'

const FREQUENCY = 2000000
const processor = Processor.create()
processor.load(rom)

function processCycles() {
  let cycles = 0

  while (cycles < FREQUENCY) {
    processor.cycle()
    cycles++
  }
}

let interval = setInterval(() => {
  processCycles()
  clearInterval(interval)
}, 1000);
