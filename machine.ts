import instructions from './instructions'

/**
 * The index designating the accumulator register A
 */
const A = 6

/**
 * The index designating the flags register F
 */
const F = 7

/**
 * The index designating the register B
 */
const B = 0

/**
 * The index designating the register C
 */
const C = 1

/**
 * The index designating the register D
 */
const D = 2

/**
 * The index designating the register E
 */
const E = 3

/**
 * The index designating the register H
 */
const H = 4

/**
 * The index designating the register L
 */
const L = 5

/**
 * The index designating the register pair BC
 */
const BC = 0

/**
 * The index designating the register pair DE
 */
const DE = 1

/**
 * The index designating the register pair HL
 */
const HL = 2

/**
 * The index designating the stack pointer register SP
 */
const SP = 4

/**
 * The index designating the program counter register PC
 */
const PC = 5

class Memory {
  private data: DataView

  constructor(size: number) {
    this.data = new DataView(new ArrayBuffer(size))
  }

  readByte(offset: number): number {
    return this.data.getUint8(offset)
  }

  writeByte(offset: number, value: number): void {
    this.data.setUint8(offset, value)
  }

  readWord(offset: number): number {
    return this.data.getUint16(offset * 2)
  }

  writeWord(offset: number, value: number): void {
    this.data.setUint16(offset * 2, value)
  }
}

class Instruction {
  private cycle: number

  constructor(
    public opcode: number, public length: number, public cycles: number,
    public execute: (processor: Processor) => void
  ) {
    this.cycle = 0
  }

  public registerCycle() {
    if (! this.isReady()) this.cycle++
  }

  public isReady(): boolean {
    return this.cycle === this.cycles
  }
}

export class Processor {
  private registers: Memory

  private instruction: Instruction | null = null

  constructor(private memory: Memory) {
    this.registers = new Memory(12)
  }

  public static create(): Processor {
    return new Processor(new Memory(0xFFFF))
  }

  public load(bytes: number[]) {
    bytes.forEach((byte, offset) => this.memory.writeByte(offset, byte))
  }

  /**
   * Get program counter
   *
   * @returns 16-bit wide value
   */
  public get PC(): number {
    return this.registers.readWord(PC)
  }

  /**
   * Set program counter
   *
   * @param value 16-bit wide value
   */
  public set PC(value: number) {
    this.registers.writeWord(PC, value)
  }

  /**
   * Accumulator register
   *
   * @returns 8-bit wide value
   */
  public get A(): number {
    return this.registers.readByte(A)
  }

  /**
   * Accumulator register
   *
   * @param value 8-bit wide value
   */
  public set A(value: number) {
    this.registers.writeByte(A, value)
  }

  /**
   * Register B
   *
   * @returns 8-bit wide value
   */
  public get B(): number {
    return this.registers.readByte(B)
  }

  /**
   * Register B
   *
   * @param value 8-bit wide value
   */
  public set B(value: number) {
    this.registers.writeByte(B, value)
  }

  /**
   * Register C
   *
   * @returns 8-bit wide value
   */
  public get C(): number {
    return this.registers.readByte(C)
  }

  /**
   * Register C
   *
   * @param value 8-bit wide value
   */
  public set C(value: number) {
    this.registers.writeByte(C, value)
  }

  /**
   * Register pair BC
   *
   * @returns 16-bit wide value
   */
  public get BC(): number {
    return this.registers.readWord(BC)
  }

  /**
   * Get byte 1 of the instruction pointed by the program counter
   *
   * @returns 8-bit wide value
   */
  private get BYTE1(): number {
    return this.memory.readByte(this.PC)
  }

  /**
   * Get byte 2 of the instruction pointed by the program counter
   *
   * @returns 8-bit wide value
   */
  private get BYTE2(): number {
    return this.memory.readByte(this.PC + 1)
  }

  /**
   * Get byte 3 of the instruction pointed by the program counter
   *
   * @returns 8-bit wide value
   */
  private get BYTE3(): number {
    return this.memory.readByte(this.PC + 2)
  }

  public cycle() {
    if (this.instruction === null) {
      const { code, length, cycles, execute } = instructions[this.BYTE1]
      this.instruction = new Instruction(code, length, cycles, execute)
    }

    if (! this.instruction.isReady()) {
      return this.instruction.registerCycle()
    }

    this.instruction.execute(this)
    this.instruction = null
  }

  /**
   * Advance program counter to point the offset where the next instruction is located in memory
   */
  private advance() {
    if (! this.instruction) {
      return
    }

    this.PC = (this.PC + this.instruction.length)
  }

  /**
   * No operation
   */
  public NOP() { this.advance() }

  /**
   * Load immediate data to register pair BC
   * - (B) ← (byte 3)
   * - (C) ← (byte 2)
   * - Byte 3 of the instruction is moved into the hi-order register B of the register pair BC
   * - Byte 2 of the instruction is moved into the lo-order register C of the register pair BC
   */
  public LXI_BC_data() {
    this.B = this.BYTE3
    this.C = this.BYTE2
    this.advance()
  }

  /**
   * Store accumulator indirect
   * - ((B) (C)) ← (A)
   * - The content of register A is moved to the memory location, whose address is in register pair BC
   */
  public STAX_BC() {
    this.memory.writeByte(this.BC, this.A)
    this.advance()
  }

  /**
   * Move data from register to register
   * - (r1) ← (r2)
   * - The content of register r2 is moved to register r1
   *
   * @param r1 3-bit wide register identifier
   * @param r2 3-bit wide register identifier
   */
  private MOV_r_r(r1: number, r2: number) {
    this.registers.writeByte(r1, this.registers.readByte(r2))
  }

  /**
   * Move data from memory to register
   * - (r) ← ((H) (L))
   * - The content of the memory location, whose address is in registers H and L, is moved to register r
   *
   * @param r 3-bit wide register identifier
   */
  private MOV_r_M(r: number) {
    this.registers.writeByte(r, this.memory.readByte(this.registers.readWord(HL)))
  }

  /**
   * Move data from register to memory
   * - ((H) (L)) ← (r)
   * - The content of register r is moved to the memory location, whose address is in registers H and L
   *
   * @param r 3-bit wide register identifier
   */
  private MOV_M_r(r: number) {
    this.memory.writeByte(this.registers.readWord(HL), this.registers.readByte(r))
  }

  /**
   * Move immediate data to register
   * - (r) ← (byte 2)
   * - The content of byte 2 of the instruction is moved to register r
   *
   * @param r 3-bit wide register identifier
   * @param value 8-bit wide value
   */
  private MVI_r_data(r: number, value: number) {
    this.registers.writeByte(r, value)
  }

  /**
   * Move immediate data to memory
   * - ((H) (L)) ← (byte 2)
   * - The content of byte 2 of the instruction is moved to the memory location, whose address is in registers H and L
   *
   * @param value 8-bit wide value
   */
  private MVI_M_data(value: number) {
    this.memory.writeByte(this.registers.readWord(HL), value)
  }

  /**
   * Load immediate data to register pair
   * - (rh) ← (byte 3)
   * - (rl) ← (byte 2)
   * - Byte 3 of the instruction is moved into the hi-order register (rh) of the register pair rp
   * - Byte 2 of the instruction is moved into the lo-order register (rl) of the register pair rp
   *
   * @param rp 2-bit wide register pair identifier
   * @param value 16-bit wide value
   */
  private LXI_rp_data(rp: number, value: number) {
    this.registers.writeWord(rp, value)
  }

  public dump() {
    console.log(`PC: ${this.PC}`)
    console.log(`A: ${this.A}`)
    console.log(`B: ${this.B}`)
    console.log(`C: ${this.C}`)
    console.log(`instruction: ${this.instruction}`)
  }
}
