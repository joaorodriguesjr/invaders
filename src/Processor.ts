import { Instruction } from './Instruction'
import { Mapper } from './Mapper'
import { Memory } from './Memory'

/**
 * Emulates Intel 8080 instructions
 */
export class Processor {

  /**
   * Memory space that allocates internal registers data
   */
  private registers: Memory

  /**
   * Instruction that is being executed
   */
  private instruction: Instruction | null = null

  /**
   * @param memory Memory of 16-bit addressable space
   */
  public constructor(private memory: Memory) {
    this.registers = new Memory(12)
  }

  /**
   * Executes 1 machine cycle
   */
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

  /**
   * Advance program counter to point where the next instruction will be in memory
   */
  private advance() {
    if (! this.instruction) {
      return
    }

    this.PC = (this.PC + this.instruction.length)
  }

  /**
   * Executes no operation
   */
  public NOP() { this.advance() }

  /**
   * General purpose register B
   *
   * @returns 8-bit wide value
   */
  public get B(): number {
    return this.registers.readByte(0)
  }

  /**
   * General purpose register B
   *
   * @param value 8-bit wide value
   */
  public set B(value: number) {
    this.registers.writeByte(0, value)
  }

  /**
   * General purpose register C
   *
   * @returns 8-bit wide value
   */
  public get C(): number {
    return this.registers.readByte(1)
  }

  /**
   * General purpose register C
   *
   * @param value 8-bit wide value
   */
  public set C(value: number) {
    this.registers.writeByte(1, value)
  }

  /**
   * General purpose register pair BC
   *
   * @returns 16-bit wide value
   */
  public get BC(): number {
    return this.registers.readWord(0)
  }

  /**
   * General purpose register pair BC
   *
   * @param value 16-bit wide value
   */
  public set BC(value: number) {
    this.registers.writeWord(0, value)
  }

  /**
   * General purpose register D
   *
   * @returns 8-bit wide value
   */
  public get D(): number {
    return this.registers.readByte(2)
  }

  /**
   * General purpose register D
   *
   * @param value 8-bit wide value
   */
  public set D(value: number) {
    this.registers.writeByte(2, value)
  }

  /**
   * General purpose register E
   *
   * @returns 8-bit wide value
   */
  public get E(): number {
    return this.registers.readByte(3)
  }

  /**
   * General purpose register E
   *
   * @param value 8-bit wide value
   */
  public set E(value: number) {
    this.registers.writeByte(3, value)
  }

  /**
   * General purpose register pair DE
   *
   * @returns 16-bit wide value
   */
  public get DE(): number {
    return this.registers.readWord(2)
  }

  /**
   * General purpose register pair DE
   *
   * @param value 16-bit wide value
   */
  public set DE(value: number) {
    this.registers.writeWord(2, value)
  }

  /**
   * General purpose register H
   *
   * @returns 8-bit wide value
   */
  public get H(): number {
    return this.registers.readByte(4)
  }

  /**
   * General purpose register H
   *
   * @param value 8-bit wide value
   */
  public set H(value: number) {
    this.registers.writeByte(4, value)
  }

  /**
   * General purpose register L
   *
   * @returns 8-bit wide value
   */
  public get L(): number {
    return this.registers.readByte(5)
  }

  /**
   * General purpose register L
   *
   * @param value 8-bit wide value
   */
  public set L(value: number) {
    this.registers.writeByte(5, value)
  }

  /**
   * General purpose register pair HL
   *
   * @returns 16-bit wide value
   */
  public get HL(): number {
    return this.registers.readWord(4)
  }

  /**
   * General purpose register pair HL
   *
   * @param value 16-bit wide value
   */
  public set HL(value: number) {
    this.registers.writeWord(4, value)
  }

  /**
   * Accumulator register
   *
   * @returns 8-bit wide value
   */
  public get A(): number {
    return this.registers.readByte(6)
  }

  /**
   * Accumulator register
   *
   * @param value 8-bit wide value
   */
  public set A(value: number) {
    this.registers.writeByte(6, value)
  }

  /**
   * Flags register
   *
   * @returns 8-bit wide value
   */
  public get F(): number {
    return this.registers.readByte(7)
  }

  /**
   * Flags register
   *
   * @param value 8-bit wide value
   */
  public set F(value: number) {
    this.registers.writeByte(7, value)
  }

  /**
   * Stack pointer register
   *
   * @returns 16-bit wide value
   */
  public get SP(): number {
    return this.registers.readWord(8)
  }

  /**
   * Stack pointer register
   *
   * @param value 16-bit wide value
   */
  public set SP(value: number) {
    this.registers.writeWord(8, value)
  }

  /**
   * Program counter
   *
   * @returns 16-bit wide value
   */
  public get PC(): number {
    return this.registers.readWord(10)
  }

  /**
   * Byte 1 of the instruction pointed by the program counter
   *
   * @returns 8-bit wide value
   */
  public get BYTE1(): number {
    return this.memory.readByte(this.PC)
  }

  /**
   * Byte 2 of the instruction pointed by the program counter
   *
   * @returns 8-bit wide value
   */
  public get BYTE2(): number {
    return this.memory.readByte(this.PC + 1)
  }

  /**
   * Byte 3 of the instruction pointed by the program counter
   *
   * @returns 8-bit wide value
   */
  public get BYTE3(): number {
    return this.memory.readByte(this.PC + 2)
  }

  /**
   * Program counter
   * @param value 16-bit wide value
   */
  public set PC(value: number) {
    this.registers.writeWord(10, value)
  }

  /**
   * Creates a default instance with no data in memory
   *
   * @returns Processor instance
   */
  public static create(): Processor {
    return new Processor(new Memory(0xFFFF))
  }
}
