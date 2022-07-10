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
    repeat(() => processor.clock(), 4)
    expect(processor.PC).toBe(1)
  })

  describe('LXI BC,data', () => {
    beforeEach(() => {
      memory.writeByte(0x00, 0x01)
      memory.writeByte(0x01, 0xFF)
      memory.writeByte(0x02, 0xAA)
      repeat(() => processor.clock(), 10)
    })

    it('Should load register B with byte3 of the instruction', () => {
      expect(processor.B).toBe(0xAA)
    })

    it('Should load register C with byte2 of the instruction', () => {
      expect(processor.C).toBe(0xFF)
    })
  })
})
