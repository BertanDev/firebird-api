import { FastifyInstance, FastifyRequest } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'
import dayjs from 'dayjs'

//* * Retorna o lucro, receita e custo por grupo de produto */

export const ProfitPerGroupProduct = async (app: FastifyInstance) => {
  app.get(
    '/profit-per-group-product',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const { finishDate, initialDate } = req.query as {
        finishDate: string
        initialDate: string
      }

      const initialDateFormatted = dayjs(initialDate).format('DD[.]MM[.]YYYY')
      const finishDateFormatted = dayjs(finishDate).format('DD[.]MM[.]YYYY')

      try {
        const sql = `SELECT
        gp.codi,
        gp.descr,
        CAST(SUM(CAST(ite.qtd AS BIGINT) * CAST(ite.prec_venda1 AS BIGINT)) AS DECIMAL(18, 2)) AS RECEITA,
        CAST(SUM(CAST(ite.qtd AS BIGINT) * CAST(ite.cust_real AS BIGINT)) AS DECIMAL(18, 2)) AS CUSTO,
        CAST(SUM(CAST(ite.qtd AS BIGINT) * CAST(ite.prec_venda1 AS BIGINT) - CAST(ite.qtd AS BIGINT) * CAST(ite.cust_real AS BIGINT)) AS DECIMAL(18, 2)) AS LUCRO
        FROM
            pedi_vend pv
        LEFT JOIN
            itens ite ON ite.nume = pv.codi AND ite.epv = 'P'
        LEFT JOIN
            prod pr ON pr.codi = ite.prodcod
        LEFT JOIN
            grup_prod gp ON gp.codi = pr.grup
        WHERE
            pv.data >= '${initialDateFormatted}' and pv.data <= '${finishDateFormatted}'
            and pv.empr = ${dbUserptions.empr}
        GROUP BY
            gp.codi, gp.descr`

        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send({ data: result })
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
