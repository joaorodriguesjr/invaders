import { Instruction } from './Instruction'
import { Processor } from './Processor'
import { hex } from './helpers'

export class Decoder {
  public static decode(byte: number): Instruction {
    switch (byte) {
      case 0x00:
        return new Instruction(1, 4 , (processor: Processor) => processor.NOP())
      case 0x01:
        return new Instruction(3, 10, (processor: Processor) => processor.LXI_BC_data())
    }

    throw new Error(`Not implemented instruction: 0x${hex(byte)}`)
  }
}
