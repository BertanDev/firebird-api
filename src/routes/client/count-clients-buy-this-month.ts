import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o total de clientes que compraram no mês atual */

export const CountClientsBuyThisMonth = async (app: FastifyInstance) => {
  app.get(
    '/count-clients-buy-this-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `SELECT COUNT(DISTINCT clie) AS TOTAL
        FROM pedi_vend
        WHERE EXTRACT(MONTH FROM DATA) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM DATA) = EXTRACT(YEAR FROM CURRENT_DATE) AND EMPR = ${dbUserptions.empr}`
        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
        return reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )
}
