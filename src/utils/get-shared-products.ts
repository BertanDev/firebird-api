import { queryDatabase } from '../baseQuery'
import { DbOptions } from '../FIREBIRD/connection'

async function getSharedProducts(dbOption: DbOptions) {
  const result = await queryDatabase(
    `select PROD_ESTO_COMP from para where empr = ${dbOption.empr}`,
    dbOption,
  )

  let { PROD_ESTO_COMP } = result as { PROD_ESTO_COMP: string }

  PROD_ESTO_COMP = PROD_ESTO_COMP.trim()

  if (PROD_ESTO_COMP !== 'S') {
    return ` AND EMPR = ${dbOption.empr} `
  } else return ''
}

export { getSharedProducts }
