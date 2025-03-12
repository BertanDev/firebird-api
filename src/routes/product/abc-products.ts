import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'
import dayjs from 'dayjs'

//* Retorna todos os produtos e valor de venda do mesmo em um deteminado período */

export const ABCProducts = async (app: FastifyInstance) => {
  app.get(
    '/abc-products',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const { finishDate, initialDate } = req.query as {
        initialDate: string
        finishDate: string
      }

      const formatInitialDate = dayjs(initialDate).format('DD[.]MM[.]YYYY')
      const formatFinishDate = dayjs(finishDate).format('DD[.]MM[.]YYYY')
      try {
        const sql = `
            select ite.prodcod as CODI, pr.descr, sum(ite.prec_venda1) as TOTAL, (sum(ite.prec_venda1) / count(ite.prodcod)) as PRECO_MEDIO, count(ite.prodcod) as QTD
            from itens ite
            left join prod pr ON pr.codi = ite.prodcod
            left join pedi_vend pv ON pv.codi = ite.nume and ite.epv = 'P'
            where pv.data >= '${formatInitialDate}' and pv.data <= '${formatFinishDate}'
            and pv.empr = ${dbUserptions.empr}
            group by 1, 2
            order by 3 desc
        `

        let result = await queryDatabase(sql, dbUserptions)

        if (!Array.isArray(result)) {
          result = [result]
        }

        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
