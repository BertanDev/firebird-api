import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'

//* * Retorna o valor total de débito de um caixa no mês atual */

export const TotalDebitMovementsCurrentMonth = async (app: FastifyInstance) => {
  app.get(
    '/total-debit-movements-current-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const { acc } = req.query as { acc: number }

      try {
        const sql = `
			SELECT
				SUM(CASE WHEN pc.tipo = 'D' THEN m.valo END) AS TOTAL
			FROM
				movi m
			JOIN
				plan_cont pc ON m.oper = pc.codi
			WHERE
				EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
				AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
				AND m.cont = ${acc}
        AND m.empr = ${dbUserptions.empr}
			`
        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
