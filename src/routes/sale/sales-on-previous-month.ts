import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'

//* * Retorna o total de vendas feitas no mês anterior */

export const SalesOnPreviousMonth = async (app: FastifyInstance) => {
  app.get(
    '/sales-on-previous-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `
			SELECT COUNT(*) as TOTAL
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
