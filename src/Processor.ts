import { Instruction, length, decode } from './Instruction'
import { Memory } from './Memory'

/**
 * Sets a bit on a given byte
 */
function set(bit: number, byte: number): number {
  return (byte | bit)
}

/**
 * Clears a bit on a given byte
 */
function clear(bit: number, byte: number): number {
  return (byte &~ bit)
}

/**
 * Checks a value for a zeroed condition
 */
function zeroed(value: number): boolean {
  return value === 0
}

/**
 * Checks a value for a signed condition
 */
function signed(value: number): boolean {
  return (value & 0b10000000) === 0b10000000
}

/**
 * Operation performed by the processor
 */
enum OP {
  /** ADD operation */
  ADD,

  /** Increment operation */
  INC,

  /** Decrement operation */
  DEC,

  /** Shift left operation */
  SHF_L,
}

/**
 * Checks a value for a auxiliary carry condition
 */
function acarry(value: number, operation: OP): boolean {
  switch (operation) {
    case OP.INC:
      return (value & 0b00001111) === 0b00001111
    case OP.DEC:
      return (value & 0b00001111) === 0b00000000
  }

  return false
}

/**
 * Checks a value for a carry condition
 */
function fcarry(value: number, operation: OP): boolean {
  switch (operation) {
    case OP.ADD:
      return (value > 0b11111111)
    case OP.SHF_L:
      return (value & 0b10000000) === 0b10000000
  }

  return false
}

/**
 * Checks a value for a parity condition
 */
function parity(value: number): boolean {
  let count = 0

  while (value > 0) {
    count += value & 1
    value >>= 1
  }

  return count % 2 === 0
}

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
    this.registers = new Memory(0xF)
  }

  /**
   * Processes a clock signal
   */
  public clock() {
    if (this.instruction === null) {
      this.fetchOpcode()

      switch (length(this.OPCODE)) {
        case 2:
          this.fetchByte2()
          break
        case 3:
          this.fetchByte2()
          this.fetchByte3()
          break
      }

      this.instruction = decode(this.OPCODE)
    }

    if (this.instruction.ready) {
      this.instruction.execute(this)
      this.instruction = null
    } else {
      this.instruction.countCycle()
    }
  }

  /**
   * Executes no operation
   */
  public NOP() { }

  /**
   * Loads register pair with immediate data
   */
  public LXI_BC_data() {
    this.B = this.W
    this.C = this.Z
  }

  /**
   * Stores accumulator into memory address pointed by register pair BC
   */
  public STAX_BC() {
    this.memory.writeByte(this.BC, this.A)
  }

  /**
   * Increments register pair BC
   */
  public INX_BC() {
    this.BC += 1
  }

  /**
   * Increments register B
   */
  public INR_B() {
    this.B += 1
    this.ZF = zeroed(this.B)
    this.SF = signed(this.B)
    this.PF = parity(this.B)
    this.AC = acarry(this.B, OP.INC)
  }

  /**
   * Decrements register B
   */
  public DCR_B() {
    this.B -= 1
    this.ZF = zeroed(this.B)
    this.SF = signed(this.B)
    this.PF = parity(this.B)
    this.AC = acarry(this.B, OP.DEC)
  }

  /**
   * Moves immediate data into register B
   */
  public MVI_B_data() {
    this.B = this.Z
  }

  /**
   * Rotates accumulator left
   */
  public RLC() {
    const cache = this.A
    this.A  = (cache << 1) | (cache >> 7)
    this.CY = fcarry(cache, OP.SHF_L)
  }

  /**
   * Adds register pair BC to register pair HL
   */
  public DAD_BC() {
    const value = this.HL + this.BC
    this.HL = value
    this.CY = fcarry(value, OP.ADD)
  }

  /**
   * Loads accumulator with memory value pointed by register pair BC
   */
  public LDAX_BC() {
    this.A = this.memory.readByte(this.BC)
  }

  /**
   * Decrements register pair BC
   */
  public DCX_BC() {
    this.BC -= 1
  }

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
   * Program counter
   *
   * @param value 16-bit wide value
   */
  public set PC(value: number) {
    this.registers.writeWord(10, value)
  }

  /**
   * Temporary register W
   *
   * @returns 8-bit wide value
   */
  public get W(): number {
    return this.registers.readByte(12)
  }

  /**
   * Temporary register W
   *
   * @param value 8-bit wide value
   */
  public set W(value: number) {
    this.registers.writeByte(12, value)
  }

  /**
   * Temporary register Z
   *
   * @returns 8-bit wide value
   */
  public get Z(): number {
    return this.registers.readByte(13)
  }

  /**
   * Temporary register Z
   *
   * @param value 8-bit wide value
   */
  public set Z(value: number) {
    this.registers.writeByte(13, value)
  }

  /**
   * Temporary register pair WZ
   *
   * @returns 16-bit wide value
   */
  public get WZ(): number {
    return this.registers.readWord(12)
  }

  /**
   * Temporary register pair WZ
   *
   * @param value 16-bit wide value
   */
  public set WZ(value: number) {
    this.registers.writeWord(12, value)
  }

  /**
   * Sign flag
   *
   * @returns true if set, false otherwise
   */
  public get SF(): boolean {
    return (this.F & 0b10000000) === 0b10000000
  }

  /**
   * Sign flag
   *
   * @param value true to set, false to clear
   */
  public set SF(value: boolean) {
    this.F = (value) ? set(0b10000000, this.F) : clear(0b10000000, this.F)
  }

  /**
   * Zero flag
   *
   * @returns true if set, false otherwise
   */
  public get ZF(): boolean {
    return (this.F & 0b01000000) === 0b01000000
  }

  /**
   * Zero flag
   *
   * @param value true to set, false to clear
   */
  public set ZF(value: boolean) {
    this.F = (value) ? set(0b01000000, this.F) : clear(0b01000000, this.F)
  }

  /**
   * Auxiliary carry flag
   *
   * @returns true if set, false otherwise
   */
  public get AC(): boolean {
    return (this.F & 0b00010000) === 0b00010000
  }

  /**
   * Auxiliary carry flag
   *
   * @param value true to set, false to clear
   */
  public set AC(value: boolean) {
    this.F = (value) ? set(0b00010000, this.F) : clear(0b00010000, this.F)
  }

  /**
   * Parity flag
   *
   * @returns true if set, false otherwise
   */
  public get PF(): boolean {
    return (this.F & 0b00000100) === 0b00000100
  }

  /**
   * Parity flag
   *
   * @param value true to set, false to clear
   */
  public set PF(value: boolean) {
    this.F = (value) ? set(0b00000100, this.F) : clear(0b00000100, this.F)
  }

  /**
   * Carry flag
   *
   * @returns true if set, false otherwise
   */
  public get CY(): boolean {
    return (this.F & 0b00000001) === 0b00000001
  }

  /**
   * Carry flag
   *
   * @param value true to set, false to clear
   */
  public set CY(value: boolean) {
    this.F = (value) ? set(0b00000001, this.F) : clear(0b00000001, this.F)
  }

  /**
   * Instruction register
   *
   * @returns 8-bit wide value
   */
  public get OPCODE(): number {
    return this.registers.readByte(14)
  }

  /**
   * Instruction register
   *
   * @param value 8-bit wide value
   */
  public set OPCODE(value: number) {
    this.registers.writeByte(14, value)
  }

  /**
   * Fetches the opcode pointed by the program counter
   */
  private fetchOpcode() {
    this.OPCODE = this.memory.readByte(this.PC)
    this.PC += 1
  }

  /**
   * Fetches the operand pointed by the program counter
   */
  private fetchByte2() {
    this.Z = this.memory.readByte(this.PC)
    this.PC += 1
  }

  /**
   * Fetches the operand pointed by the program counter
   */
  private fetchByte3() {
    this.W = this.memory.readByte(this.PC)
    this.PC += 1
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
