import { Processor } from '../src/Processor'
import { Memory } from '../src/Memory'

describe('Processor', () => {
  let memory: Memory
  let processor: Processor

  beforeEach(() => {
    memory = new Memory(0xFFFF)
    processor = new Processor(memory)
  })

  it('Should increment program counter by 1 when a NOP is executed', () => {
    processor.cycle()
    processor.cycle()
    processor.cycle()
    processor.cycle()
    expect(processor.PC).toBe(1)
  })
})
