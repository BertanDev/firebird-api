import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o total de vendas feitas por cada vendedor  */

export const TotalSalesPerSeller = async (app: FastifyInstance) => {
  app.get(
    '/total-sales-per-seller',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const { func_code } = req.query as { func_code: number }

      const sql = `select
      c_func,
      EXTRACT(MONTH FROM data) AS mes,
      EXTRACT(YEAR FROM data) AS ano,
        count(*)
      from pedi_vend
      WHERE 
        c_func = ${func_code} and data >= CURRENT_DATE - 365
        and empr = ${dbUserptions.empr}
      GROUP BY 
        mes, ano, c_func
      ORDER BY 
        ano , mes `

      try {
        const result = await queryDatabase(sql, dbUserptions)

        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
