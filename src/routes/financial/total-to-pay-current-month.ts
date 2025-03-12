import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o valor total de títulos a pagar em aberto do mês atual */

export const TotalToPayCurrentMonth = async (app: FastifyInstance) => {
  app.get(
    '/total-to-pay-current-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `
			SELECT SUM(sald) as TOTAL
			FROM titup
			WHERE 
				EXTRACT(MONTH FROM venc) = EXTRACT(MONTH FROM CURRENT_DATE)
				AND EXTRACT(YEAR FROM venc) = EXTRACT(YEAR FROM CURRENT_DATE)
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
