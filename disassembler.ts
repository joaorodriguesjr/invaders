import bytes from './rom/bytes'
import instructions from './instructions'

function hex(data: number, size: number) {
  return data.toString(16).padStart(size * 2, '0')
}

let index = 0

while (index < bytes.length) {
  const instruction = instructions[bytes[index]]

  let byte2 = ''
  let byte3 = ''

  let data     = ''
  let assembly = ''

  switch (instruction.length) {
    case 1:
      data = `     `
      assembly = instruction.mnemonic
      break
    case 2:
      byte2 = hex(bytes[index + 1], 1)

      data = `${byte2}   `

      assembly = instruction.mnemonic
        .replace(',d8', ',#$' + byte2)
        .replace(' d8', ' #$' + byte2)
      break
    case 3:
      byte2 = hex(bytes[index + 1], 1)
      byte3 = hex(bytes[index + 2], 1)

      data = `${byte2} ${byte3}`

      assembly = instruction.mnemonic
        .replace(',d16', ',#$' + byte3 + byte2)
        .replace(' d16', ' #$' + byte3 + byte2)
        .replace(',a16', ',$'  + byte3 + byte2)
        .replace(' a16', ' $'  + byte3 + byte2)
      break
  }

  console.log(hex(index, 2), hex(instruction.code, 1), data, assembly)
  index += instruction.length
}
