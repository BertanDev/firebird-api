import { readFile } from 'fs'

/**
 * @param option string
 * @returns Promise<string>
 */

export function readConfig(option: string): Promise<string> {
  const filePath = 'C:/BASE/admConfig.txt'

  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Erro ao ler o arquivo: ${err}`)
        reject(err)
        return
      }

      const lines = data.split(/\r?\n/)

      const optUpperCase = option.toUpperCase()

      const optionIndex = lines.findIndex((line) =>
        line.startsWith(`${optUpperCase}=`),
      )

      if (optionIndex !== -1) {
        const lineReturn = lines[optionIndex]
        const division = lineReturn.split(optUpperCase + '=')

        resolve(division[1])
      } else {
        reject(new Error(`Opção "${optUpperCase}" não encontrada no arquivo.`))
      }
    })
  })
}
