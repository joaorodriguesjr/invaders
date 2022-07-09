import { Processor } from './Processor'

export class Instruction {
  private cycle: number

  constructor(
    public length: number, public cycles: number,
    public execute: (processor: Processor) => void
  ) {
    this.cycle = 1
  }

  public registerCycle() {
    if (! this.isReady()) this.cycle++
  }

  public isReady(): boolean {
    return this.cycle === this.cycles
  }
}
