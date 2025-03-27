import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'
import dayjs from 'dayjs'

//* * Retorna uma lista com todos os produtos vendidos para certo cliente agrupados por data*/

export const ProductsPerClient = async (app: FastifyInstance) => {
  app.get(
    '/products-per-client',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const { finishDate, initialDate, client } = req.query as {
        initialDate: string
        finishDate: string
        client: number
      }

      const formatInitialDate = dayjs(initialDate).format('DD[.]MM[.]YYYY')
      const formatFinishDate = dayjs(finishDate).format('DD[.]MM[.]YYYY')

      try {
        const sql = `select p.codi, p.descr, ite.qtd, ite.prec_venda1, pv.data from itens ite
					left join pedi_vend pv on ite.nume = pv.codi
					left join prod p on p.codi = ite.prodcod
					where ite.epv = 'P'
					and pv.data between '${formatInitialDate}' and '${formatFinishDate}'
					and pv.clie = ${client} 
          and pv.empr = ${dbUserptions.empr}
					group by 5,1,2,3,4
					`
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
