import { Processor } from './Processor'

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
  public isReady(): boolean {
    return this.cycle === this.cycles
  }
}
