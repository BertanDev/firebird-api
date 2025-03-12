import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { DbOptions } from '../../FIREBIRD/connection'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'

//* * Retorna o balanço entre os titulos a pagar e a receber */

export const TotalBalance = async (app: FastifyInstance) => {
  app.get(
    '/total-balance',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        let sql = `
			select sum(sald) as TOTAL from titur where empr = ${dbUserptions.empr}
			`
        const totalTituR = (await queryDatabase(sql, dbUserptions)) as {
          TOTAL: number
        }

        sql = `
			select sum(sald) as TOTAL from titup where empr = ${dbUserptions.empr} 
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
