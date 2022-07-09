export class Memory {
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
    return this.data.getUint16(offset)
  }

  writeWord(offset: number, value: number): void {
    this.data.setUint16(offset, value)
  }
}
