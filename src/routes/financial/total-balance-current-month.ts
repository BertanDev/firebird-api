import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o balanço entre os titulos a pagar e a receber do mês atual */

export const TotalBalanceCurrentMonth = async (app: FastifyInstance) => {
  app.get(
    '/total-balance-current-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        let sql = `
			SELECT SUM(sald) as TOTAL
			FROM titur
			WHERE 
				EXTRACT(MONTH FROM venc) = EXTRACT(MONTH FROM CURRENT_DATE)
				AND EXTRACT(YEAR FROM venc) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EMPR = ${dbUserptions.empr}
			`
        const totalTituR = (await queryDatabase(sql, dbUserptions)) as {
          TOTAL: number
        }

        sql = `
			SELECT SUM(sald) as TOTAL
			FROM titup
			WHERE 
				EXTRACT(MONTH FROM venc) = EXTRACT(MONTH FROM CURRENT_DATE)
				AND EXTRACT(YEAR FROM venc) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EMPR = ${dbUserptions.empr}
			`

        const totalTituP = (await queryDatabase(sql, dbUserptions)) as {
          TOTAL: number
        }

        const result = totalTituR.TOTAL - totalTituP.TOTAL
        return reply.status(200).send({ TOTAL: result })
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
