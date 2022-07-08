/**
 * The bit pattern designating the accumulator register A
 */
const A = 0b111

/**
 * The bit pattern designating the register B
 */
const B = 0b000

/**
 * The bit pattern designating the register C
 */
const C = 0b001

/**
 * The bit pattern designating the register D
 */
const D = 0b010

/**
 * The bit pattern designating the register E
 */
const E = 0b011

/**
 * The bit pattern designating the register H
 */
const H = 0b100

/**
 * The bit pattern designating the register L
 */
const L = 0b101

/**
 * The bit pattern designating the register pair B-C
 */
const BC = 0b00

/**
 * The bit pattern designating the register pair D-E
 */
const DE = 0b01

/**
 * The bit pattern designating the register pair H-L
 */
const HL = 0b10

/**
 * The bit pattern designating the stack pointer register
 */
const SP = 0b11

const registers = {
  data: new DataView(new ArrayBuffer(0xF)),

  read(register: number): number {
    return registers.data.getUint8(register)
  },

  write(register: number, value: number): void {
    registers.data.setUint8(register, value)
  },

  readPair(pair: number): number {
    return registers.data.getUint16(pair * 2)
  },

  writePair(pair: number, value: number): void {
    registers.data.setUint16(pair * 2, value)
  },
}

const memory = {
  data: new DataView(new ArrayBuffer(0xFFFF)),

  read(address: number): number {
    return memory.data.getUint8(address)
  },

  write(address: number, value: number): void {
    memory.data.setUint8(address, value)
  },
}

/**
 * Move data from register to register
 * - (r1) ← (r2)
 * - The content of register r2 is moved to register r1
 *
 * @param r1 3-bit wide register identifier
 * @param r2 3-bit wide register identifier
 */
function MOV_r_r(r1: number, r2: number) {
  registers.write(r1, registers.read(r2))
}

/**
 * Move data from memory to register
 * - (r) ← ((H) (L))
 * - The content of the memory location, whose address is in registers H and L, is moved to register r
 *
 * @param r 3-bit wide register identifier
 */
function MOV_r_M(r: number) {
  registers.write(r, memory.read(registers.readPair(HL)))
}

/**
 * Move data from register to memory
 * - ((H) (L)) ← (r)
 * - The content of register r is moved to the memory location, whose address is in registers H and L
 *
 * @param r 3-bit wide register identifier
 */
function MOV_M_r(r: number) {
  memory.write(registers.readPair(HL), registers.read(r))
}

/**
 * Move immediate data to register
 * - (r) ← (byte 2)
 * - The content of byte 2 of the instruction is moved to register r
 *
 * @param r 3-bit wide register identifier
 * @param value 8-bit wide value
 */
function MVI_r_data(r: number, value: number) {
  registers.write(r, value)
}

/**
 * Move immediate data to memory
 * - ((H) (L)) ← (byte 2)
 * - The content of byte 2 of the instruction is moved to the memory location, whose address is in registers H and L
 *
 * @param value 8-bit wide value
 */
function MVI_M_data(value: number) {
  memory.write(registers.readPair(HL), value)
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
function LXI_rp_data16(rp: number, value: number) {
  registers.writePair(rp, value)
}

class Memory {
  private data: DataView

  constructor(size: number) {
    this.data = new DataView(new ArrayBuffer(size))
  }

  read(address: number): number {
    return this.data.getUint8(address)
  }

  write(address: number, value: number): void {
    this.data.setUint8(address, value)
  }
}

class Registers {
  private data: DataView

  constructor(size: number) {
    this.data = new DataView(new ArrayBuffer(size))
  }

  read(register: number): number {
    return this.data.getUint8(register)
  }

  write(register: number, value: number): void {
    this.data.setUint8(register, value)
  }

  readPair(pair: number): number {
    return this.data.getUint16(pair * 2)
  }

  writePair(pair: number, value: number): void {
    this.data.setUint16(pair * 2, value)
  }
}

class Instruction {
  private cycle: number

  constructor(public opcode: number, public cycles: number) {
    this.cycle = 0
  }

  public count(): void {
    if (! this.ready()) this.cycle++
  }

  public ready(): boolean {
    return this.cycle === this.cycles
  }
}

class Processor {
  private instruction: Instruction

  private PC: number = 0

  constructor(private registers: Registers, private memory: Memory) {}

  public static create(): Processor {
    return new Processor(new Registers(0xF), new Memory(0xFFFF))
  }

  public cycle() {
    if (! this.instruction) {
      this.instruction = this.fetch()
    }
  }

  /**
   * Register B
   *
   * @returns 8-bit wide value
   */
  public get B(): number {
    return this.registers.read(B)
  }

  /**
   * Register B
   *
   * @param value 8-bit wide value
   */
  public set B(value: number) {
    this.registers.write(B, value)
  }

  /**
   * Register C
   *
   * @returns 8-bit wide value
   */
  public get C(): number {
    return this.registers.read(C)
  }

  /**
   * Register C
   *
   * @param value 8-bit wide value
   */
  public set C(value: number) {
    this.registers.write(C, value)
  }

  /**
   * Register pair BC
   *
   * @returns 16-bit wide value
   */
  public get BC(): number {
    return this.registers.readPair(BC)
  }

  private fetch(): Instruction {
    throw new Error('Method not implemented.')
  }

  /**
   * No operation
   */
  public NOP() { this.incrementPC() }

  /**
   * Load immediate data to register pair BC
   * - (B) ← (byte 3)
   * - (C) ← (byte 2)
   * - Byte 3 of the instruction is moved into the hi-order register B of the register pair BC
   * - Byte 2 of the instruction is moved into the lo-order register C of the register pair BC
   */
  public LXI_BC_data() {
    this.B = this.memory.read(this.PC + 2)
    this.C = this.memory.read(this.PC + 1)
    this.incrementPC(3)
  }

  /**
   * Store accumulator indirect
   * - ((B) (C)) ← (A)
   * - The content of register A is moved to the memory location, whose address is in register pair BC
   */
  public STAX_BC() {
    this.memory.write(this.BC, this.registers.read(A))
    this.incrementPC()
  }

  private incrementPC(factor: number = 1) {
    this.PC += factor
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
    this.registers.write(r1, this.registers.read(r2))
  }

  /**
   * Move data from memory to register
   * - (r) ← ((H) (L))
   * - The content of the memory location, whose address is in registers H and L, is moved to register r
   *
   * @param r 3-bit wide register identifier
   */
  private MOV_r_M(r: number) {
    this.registers.write(r, this.memory.read(this.registers.readPair(HL)))
  }

  /**
   * Move data from register to memory
   * - ((H) (L)) ← (r)
   * - The content of register r is moved to the memory location, whose address is in registers H and L
   *
   * @param r 3-bit wide register identifier
   */
  private MOV_M_r(r: number) {
    this.memory.write(this.registers.readPair(HL), this.registers.read(r))
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
    this.registers.write(r, value)
  }

  /**
   * Move immediate data to memory
   * - ((H) (L)) ← (byte 2)
   * - The content of byte 2 of the instruction is moved to the memory location, whose address is in registers H and L
   *
   * @param value 8-bit wide value
   */
  private MVI_M_data(value: number) {
    this.memory.write(this.registers.readPair(HL), value)
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
    this.registers.writePair(rp, value)
  }
}
