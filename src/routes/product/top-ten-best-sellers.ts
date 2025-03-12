import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'

//* Retorna os dez produtos mais vendidos do último mês */

export const TopTenBestSellers = async (app: FastifyInstance) => {
  app.get(
    '/top-ten-best-sellers',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `SELECT
          FIRST(10) ite.prodcod,
          pr.descr,
          SUM(CASE WHEN EXTRACT(MONTH FROM pv.data) = EXTRACT(MONTH FROM CURRENT_DATE) THEN ite.qtd ELSE 0 END) AS total_atual,
          SUM(CASE WHEN EXTRACT(MONTH FROM pv.data) = EXTRACT(MONTH FROM DATEADD(-1 MONTH TO CURRENT_DATE)) THEN ite.qtd ELSE 0 END) AS total_mes_anterior
        FROM
          itens ite
          LEFT JOIN prod pr ON pr.codi = ite.prodcod
          LEFT JOIN pedi_vend pv ON pv.codi = ite.nume AND ite.epv = 'P'
        WHERE
          EXTRACT(MONTH FROM CAST(pv.data AS DATE)) IN (EXTRACT(MONTH FROM CURRENT_DATE), EXTRACT(MONTH FROM DATEADD(-1 MONTH TO CURRENT_DATE)))
          AND pv.empr = ${dbUserptions.empr}
        GROUP BY
          ite.prodcod, pr.descr
        ORDER BY
          total_atual DESC;
          `

        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
