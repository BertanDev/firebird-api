import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'

//* * Retorna o codigo e nome de todos os funcionários  */

export const Employees = async (app: FastifyInstance) => {
  app.get(
    '/employees',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = 'SELECT codi, nome from FUNC'

        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
        return reply.status(500).send({ error: 'Internal Server Error' })
      }
    },
  )
}
