import { Instruction } from './Instruction'
import { Processor } from './Processor'
import { hex } from './helpers'

export class Mapper {
  public static map(byte: number): Instruction {
    switch (byte) {
      case 0x00:
        return new Instruction(1, 4, (processor: Processor) => processor.NOP())
    }

    throw new Error(`Not implemented instruction: 0x${hex(byte)}`)
  }
}
