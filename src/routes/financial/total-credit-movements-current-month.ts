import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o valor total de crédito de um caixa no mês atual */

export const TotalCreditMovementsCurrentMonth = async (
  app: FastifyInstance,
) => {
  app.get(
    '/total-credit-movements-current-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const { acc } = req.query as { acc: number }

      try {
        const sql = `
			SELECT
				SUM(CASE WHEN pc.tipo = 'C' THEN m.valo END) AS TOTAL
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
