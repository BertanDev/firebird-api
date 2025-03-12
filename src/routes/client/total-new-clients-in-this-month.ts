import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'
import { getSharedClients } from '../../utils/get-shared-clients'

//* * Retorna o total de clientes que compraram no mês atual */

export const TotalNewClientsInThisMonth = async (app: FastifyInstance) => {
  app.get(
    '/total-new-clients-in-this-month',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `SELECT COUNT(*) AS TOTAL FROM CLIEFORN WHERE TIPOCAD IN ('A', 'C') AND ATIVO = 'S'
        AND EXTRACT(MONTH FROM DATA) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM DATA) = EXTRACT(YEAR FROM CURRENT_DATE) ${await getSharedClients(
          dbUserptions,
        )}`
        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
        return reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )
}
