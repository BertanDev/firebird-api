import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o total da receita de vendas feitas no mês anterior  */

export const SalesOnPreviousMonthMoney = async (app: FastifyInstance) => {
  app.get(
    '/sales-on-previous-month-money',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `
			SELECT SUM(total) as TOTAL
			FROM pedi_vend
			WHERE 
				EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM DATEADD(MONTH, -1, CURRENT_DATE))
				AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM DATEADD(MONTH, -1, CURRENT_DATE))
        AND EMPR = ${dbUserptions.empr}
			`

        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
