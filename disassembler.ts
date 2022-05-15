import bytes from './INVADERS'
import instructions from './instructions'

function hex(data: number, size: number) {
  return data.toString(16).padStart(size * 2, '0')
}

let index = 0

while (index < 0xFF) {
  const byte = bytes[index]
  const instruction = instructions[byte]

  let data = '', assembly = ''

  const byte_01 = hex(bytes[index + 1], 1)
  const byte_02 = hex(bytes[index + 2], 1)

  switch (instruction.length) {
    case 1:
      data = '     '
      assembly = instruction.mnemonic
      break

    case 2:
      data = `${byte_01}   `
      assembly = instruction.mnemonic
        .replace(',d8', ',#$' + byte_01)
        .replace(' d8', ' #$' + byte_01)
      break

    case 3:
      data = `${byte_01} ${byte_02}`
      assembly = instruction.mnemonic
        .replace(',d16', ',#$' + byte_02 + byte_01)
        .replace(' d16', ' #$' + byte_02 + byte_01)
        .replace(',a16', ',$'  + byte_02 + byte_01)
        .replace(' a16', ' $'  + byte_02 + byte_01)
      break
  }

  console.log(hex(index, 2), hex(instruction.code, 1), data, assembly)
  index += instruction.length
}
