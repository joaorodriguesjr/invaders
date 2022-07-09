import { Processor } from '../src/Processor'

describe('Processor', () => {
  let processor: Processor

  beforeEach(() => {
    processor = new Processor()
  })

  it('should be defined', () => {
    expect(processor).toBeDefined()
  })
})
