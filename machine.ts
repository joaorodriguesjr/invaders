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
