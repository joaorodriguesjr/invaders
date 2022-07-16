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

  describe('NOP', () => {
    beforeEach(() => repeat(() => processor.clock(), 4))

    it('Should increment program counter by 1', () => {
      expect(processor.PC).toBe(1)
    })
  })

  describe('LXI BC,data', () => {
    beforeEach(() => {
      memory.writeByte(0x00, 0x01)
      memory.writeByte(0x01, 0xFF)
      memory.writeByte(0x02, 0xAA)
      repeat(() => processor.clock(), 10)
    })

    it('Should load register B with byte3 of the instruction', () => {
      expect(processor.B).toBe(memory.readByte(0x02))
    })

    it('Should load register C with byte2 of the instruction', () => {
      expect(processor.C).toBe(memory.readByte(0x01))
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

  describe('INX BC', () => {
    const value = 0xAA0F

    beforeEach(() => {
      memory.writeByte(0x00, 0x03)
      processor.BC = value
      repeat(() => processor.clock(), 5)
    })

    it('Should increment register pair BC by 1', () => {
      expect(processor.BC).toBe(value + 1)
    })

    it('Should increment program counter by 1', () => {
      expect(processor.PC).toBe(1)
    })
  })

  describe('INR B', () => {
    const value = 0xAA

    beforeEach(() => {
      memory.writeByte(0x00, 0x04)
      processor.B = value
      repeat(() => processor.clock(), 5)
    })

    it('Should increment register B by 1', () => {
      expect(processor.B).toBe(value + 1)
    })

    it('Should increment program counter by 1', () => {
      expect(processor.PC).toBe(1)
    })
  })

  describe('DCR B', () => {
    const value = 0xAA

    beforeEach(() => {
      memory.writeByte(0x00, 0x05)
      processor.B = value
      repeat(() => processor.clock(), 5)
    })

    it('Should decrement register B by 1', () => {
      expect(processor.B).toBe(value - 1)
    })

    it('Should increment program counter by 1', () => {
      expect(processor.PC).toBe(1)
    })
  })

  describe('MVI B,data', () => {
    beforeEach(() => {
      memory.writeByte(0x00, 0x06)
      memory.writeByte(0x01, 0xFF)
      repeat(() => processor.clock(), 7)
    })

    it('Should load register B with byte2 of the instruction', () => {
      expect(processor.B).toBe(memory.readByte(0x01))
    })

    it('Should increment program counter by 2', () => {
      expect(processor.PC).toBe(2)
    })
  })

  describe('RLC', () => {
    beforeEach(() => {
      processor.A = 0b10101010
      memory.writeByte(0x00, 0x07)
      repeat(() => processor.clock(), 4)
    })

    it('Should shift accumulator register left', () => {
      expect(processor.A).toBe(0b01010101)
    })

    it('Should set the flag when there is a carry', () => {
      expect(processor.CY).toBe(true)
    })
  })

  describe('NOP', () => {
    beforeEach(() => {
      memory.writeByte(0x00, 0x08)
      repeat(() => processor.clock(), 4)
    })

    it('Should increment program counter by 1', () => {
      expect(processor.PC).toBe(1)
    })
  })

  describe('DAD BC', () => {
    beforeEach(() => {
      processor.HL = 0x0100
      processor.BC = 0xFF00
      memory.writeByte(0x00, 0x09)
      repeat(() => processor.clock(), 10)
    })

    it('Should increment register pair HL with register pair BC', () => {
      expect(processor.HL).toBe(0x0000)
    })

    it('Should set the flag when there is a carry', () => {
      expect(processor.CY).toBe(true)
    })
  })
})
