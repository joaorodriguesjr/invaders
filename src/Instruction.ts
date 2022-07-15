import { Processor } from './Processor'
import { hex } from './helpers'

/**
 * Holds instruction related information
 */
export class Instruction {

  /**
   * Last registered cycle number
   */
  private cycle: number

  /**
   * @param length Number of bytes that this instruction will take
   * @param cycles Number of cycles that this instruction will take
   * @param execute Exceution callback
   */
  constructor(
    public length: number, public cycles: number,
    public execute: (processor: Processor) => void
  ) {
    this.cycle = 1
  }

  /**
   * Registers a cycle
   */
  public countCycle() { this.cycle++ }

  /**
   * @returns True if this instruction is ready to be executed
   */
  public get ready(): boolean {
    return this.cycle === this.cycles
  }
}

/**
 * Processor instruction set
 */
const instructions = [
  { length: 1, cycles: 4 , execute: (processor: Processor) => processor.NOP() },
  { length: 3, cycles: 10, execute: (processor: Processor) => processor.LXI_BC_data() },
  { length: 1, cycles: 7 , execute: (processor: Processor) => processor.STAX_BC() },
  { length: 1, cycles: 5 , execute: (processor: Processor) => processor.INX_BC() },
  { length: 1, cycles: 5 , execute: (processor: Processor) => processor.INR_B() },
  { length: 1, cycles: 5 , execute: (processor: Processor) => processor.DCR_B() },
  { length: 2, cycles: 7 , execute: (processor: Processor) => processor.MVI_B_data() },
  { length: 1, cycles: 4 , execute: (processor: Processor) => processor.RLC() },
  { length: 1, cycles: 4 , execute: (processor: Processor) => processor.NOP() },
]

/**
 * Validates the instruction existence for a given opcode
 *
 * @param opcode 8-bit opcode
 */
function validate(opcode: number) {
  if (instructions[opcode] === undefined)
    throw new Error(`Not implemented instruction: 0x${hex(opcode)}`)
}

/**
 * Evaluates an opcode and provides its correspondent instruction
 *
 * @param opcode 8-bit opcode
 * @returns The instruction that corresponds to the opcode
 */
export function decode(opcode: number): Instruction {
  validate(opcode)

  const { length, cycles, execute } = instructions[opcode]
  return new Instruction(length, cycles, execute)
}

/**
 * Provides the length of a instruction based on its opcode
 *
 * @param opcode 8-bit opcode
 * @returns The length of the mapped instruction
 */
export function length(opcode: number): number {
  validate(opcode)
  return instructions[opcode].length
}
