import { Instruction } from './Instruction'
import { Processor } from './Processor'
import { hex } from './helpers'

export class Decoder {
  public static instructions = [
    { length : 1, cycles : 4 , execute : (processor: Processor) => processor.NOP() },
    { length : 3, cycles : 10, execute : (processor: Processor) => processor.LXI_BC_data() },
    { length : 1, cycles : 7 , execute : (processor: Processor) => processor.STAX_BC() },
    { length : 1, cycles : 5 , execute : (processor: Processor) => processor.INX_BC() },
  ]

  public static decode(opcode: number): Instruction {
    if (this.instructions[opcode] === undefined) {
      throw new Error(`Not implemented instruction: 0x${hex(opcode)}`)
    }

    const { length, cycles, execute } = this.instructions[opcode]
    return new Instruction(length, cycles, execute)
  }
}
