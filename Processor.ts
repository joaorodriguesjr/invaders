import instructions from './instructions'

export class Flags {
  public Z = 0
  public S = 0
  public P = 0

  public CY = 0
  public AC = 0
}

export class Processor {
  public flags = new Flags()

  public A = 0
  public B = 0
  public C = 0
  public D = 0
  public E = 0
  public H = 0
  public L = 0

  public SP = 0
  public PC = 0

  public memory: number[]

  public operations: (() => void)[]

  public constructor(rom: number[]) {
    this.memory = [ ...rom ]

    this.operations = [
      () => this.NOP(), () => this.LXI_B(), () => this.STAX_B(), () => this.INX_B(),
    ]
  }

  public cycle() {
    const opcode = this.memory[this.PC]

    if (opcode > this.operations.length)
      throw new Error(`Opcode not implemented for: ${instructions[opcode].mnemonic}`)

    this.operations[opcode]()
  }

  /**
   * No operation
   */
  public NOP() {
    this.PC += 1
  }

  /**
   * Load A from memory at B and C
   */
  public LXI_B() {
    this.C = this.memory[this.PC + 1]
    this.B = this.memory[this.PC + 2]
    this.PC += 3
  }

  /**
   * Store A in memory at B and C
   */
  public STAX_B() {
    const address = (this.B << 8) | this.C
    this.memory[address] = this.A
    this.PC += 1
  }

  /**
   * Increment B and C
   */
  public INX_B() {
    const increment = ((this.B << 8) | this.C) + 1
    this.B = (increment >> 8) & 0xFF
    this.C = increment & 0xFF
    this.PC += 1
  }
}
