import { Processor } from './Processor'

const processor = new Processor([ 0x02, 0x00 ])
processor.A = 0x10
processor.B = 0x00
processor.C = 0x01

function loop(callback: () => void) {
  setInterval(() => {
    let i = 0
    while (i < 20000) i++ || callback()
  }, 10)
}

loop(() => processor.cycle())
