import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'
import { getSharedClients } from '../../utils/get-shared-clients'

//* * Retorna uma lista com todos os clientes cadastrados no sistema contendo nome e código por ordem alfabética*/

export const AllClients = async (app: FastifyInstance) => {
  app.get(
    '/all-clients',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `SELECT nome, codi FROM clieforn where tipocad in ('A', 'C') ${await getSharedClients(
          dbUserptions,
        )} and nome <> '' order by nome`
        let result = await queryDatabase(sql, dbUserptions)

        if (!Array.isArray(result)) {
          result = [result]
        }

        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
        return reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )
}
