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

  it('Should throw error if instruction is not implemented', () => {
    memory.writeByte(0x00, 0xFF)
    expect(() => processor.clock()).toThrow('Not implemented instruction: 0xFF')
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

    it('Should increment program counter by 3', () => {
      expect(processor.PC).toBe(3)
    })
  })

  describe('STAX BC', () => {
    beforeEach(() => {
      memory.writeByte(0x00, 0x02)
      processor.A = 0xFF
      processor.B = 0xAA
      processor.C = 0xBB
      repeat(() => processor.clock(), 7)
    })

    it('Should store accumulator into memory', () => {
      expect(memory.readByte(processor.BC)).toBe(processor.A)
    })

    it('Should increment program counter by 1', () => {
      expect(processor.PC).toBe(1)
    })
  })
})
