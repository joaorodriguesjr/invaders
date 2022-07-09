import { Instruction } from './Instruction'
import { Mapper } from './Mapper'
import { Memory } from './Memory'

export class Processor {
  private registers: Memory

  private instruction: Instruction | null = null

  public constructor(private memory: Memory) {
    this.registers = new Memory(12)
  }

  public NOP() { this.advance() }

  public cycle() {
    if (this.instruction === null) {
      this.instruction = Mapper.map(this.BYTE1)
    }

    if (! this.instruction.isReady()) {
      return this.instruction.registerCycle()
    }

    this.instruction.execute(this)
    this.instruction = null
  }

  private advance() {
    if (! this.instruction) {
      return
    }

    this.PC = (this.PC + this.instruction.length)
  }

  public get B(): number {
    return this.registers.readByte(0)
  }

  public set B(value: number) {
    this.registers.writeByte(0, value)
  }

  public get C(): number {
    return this.registers.readByte(1)
  }

  public set C(value: number) {
    this.registers.writeByte(1, value)
  }

  public get BC(): number {
    return this.registers.readWord(0)
  }

  public set BC(value: number) {
    this.registers.writeWord(0, value)
  }

  public get D(): number {
    return this.registers.readByte(2)
  }

  public set D(value: number) {
    this.registers.writeByte(2, value)
  }

  public get E(): number {
    return this.registers.readByte(3)
  }

  public set E(value: number) {
    this.registers.writeByte(3, value)
  }

  public get DE(): number {
    return this.registers.readWord(2)
  }

  public set DE(value: number) {
    this.registers.writeWord(2, value)
  }

  public get H(): number {
    return this.registers.readByte(4)
  }

  public set H(value: number) {
    this.registers.writeByte(4, value)
  }

  public get L(): number {
    return this.registers.readByte(5)
  }

  public set L(value: number) {
    this.registers.writeByte(5, value)
  }

  public get HL(): number {
    return this.registers.readWord(4)
  }

  public set HL(value: number) {
    this.registers.writeWord(4, value)
  }

  public get A(): number {
    return this.registers.readByte(6)
  }

  public set A(value: number) {
    this.registers.writeByte(6, value)
  }

  public get F(): number {
    return this.registers.readByte(7)
  }

  public set F(value: number) {
    this.registers.writeByte(7, value)
  }

  public get SP(): number {
    return this.registers.readWord(8)
  }

  public set SP(value: number) {
    this.registers.writeWord(8, value)
  }

  public get PC(): number {
    return this.registers.readWord(10)
  }

  public get BYTE1(): number {
    return this.memory.readByte(this.PC)
  }

  public get BYTE2(): number {
    return this.memory.readByte(this.PC + 1)
  }

  public get BYTE3(): number {
    return this.memory.readByte(this.PC + 2)
  }

  public set PC(value: number) {
    this.registers.writeWord(10, value)
  }

  public static create(): Processor {
    return new Processor(new Memory(0xFFFF))
  }
}
