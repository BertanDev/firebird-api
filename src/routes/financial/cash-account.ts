import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { dbOptions, DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'

//* * Retorna o codigo, nome e saldo de todas as contas */

export const CashAccount = async (app: FastifyInstance) => {
  app.get(
    '/cash-account',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `
			SELECT
				CODI, NOME, SALD
			FROM CONT WHERE EMPR = ${dbOptions.empr} OR EXIB_EMPR = 'S'
			`
        const result = await queryDatabase(sql, dbUserptions)

        let cashAccounts = result

        if (!Array.isArray(result)) {
          cashAccounts = [result]
        }

        return reply.status(200).send(cashAccounts)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
