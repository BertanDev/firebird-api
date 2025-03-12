import { queryDatabase } from '../baseQuery'
import { DbOptions } from '../FIREBIRD/connection'

async function getSharedClients(dbOption: DbOptions) {
  const result = await queryDatabase(
    `select compartilhar_clientes from para where empr = ${dbOption.empr}`,
    dbOption,
  )

  let { COMPARTILHAR_CLIENTES } = result as { COMPARTILHAR_CLIENTES: string }

  COMPARTILHAR_CLIENTES = COMPARTILHAR_CLIENTES.trim()

  if (COMPARTILHAR_CLIENTES !== 'S') {
    return ` AND EMPRESA = ${dbOption.empr} `
  } else return ''
}

export { getSharedClients }
