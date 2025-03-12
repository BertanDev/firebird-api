import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o valor total de títulos a receber em aberto do mês atual */

export const TotalReceivableCurrentMonth = async (app: FastifyInstance) => {
  app.get(
    '/total-receivable-current-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `
			SELECT SUM(sald) as TOTAL
			FROM titur
			WHERE 
				EXTRACT(MONTH FROM venc) = EXTRACT(MONTH FROM CURRENT_DATE)
				AND EXTRACT(YEAR FROM venc) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND empr = ${dbUserptions.empr}
			`
        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
