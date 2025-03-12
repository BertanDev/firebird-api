import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { getSharedProducts } from '../../utils/get-shared-products'

//* * Retorna os dez produtos com o maior custo real */

export const MostExpensiveProducts = async (app: FastifyInstance) => {
  app.get(
    '/most-expensive-products',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `SELECT codi,  descr FROM prod JOIN prod_custos ON codi = cust_prod_codi ORDER BY cust_custo_real DESC ROWS 10 ${await getSharedProducts(
          dbUserptions,
        )}`

        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send({ data: result })
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
