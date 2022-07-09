import { Processor } from '../src/Processor'
import { Memory } from '../src/Memory'
import { repeat } from '../src/helpers'

describe('Processor', () => {
  let memory: Memory
  let processor: Processor

  beforeEach(() => {
    memory = new Memory(0xFFFF)
    processor = new Processor(memory)
  })

  it('Should increment program counter by 1 when a NOP is executed', () => {
    repeat(() => processor.cycle(), 4)
    expect(processor.PC).toBe(1)
  })
})
