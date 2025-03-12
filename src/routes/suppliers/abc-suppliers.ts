import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'
import dayjs from 'dayjs'

//* Retorna todos os fornecedores e valor de compra do mesmo em um deteminado período */

export const ABCSuppliers = async (app: FastifyInstance) => {
  app.get(
    '/abc-suppliers',
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
      console.log(formatInitialDate)
      console.log(formatFinishDate)

      try {
        const sql = `
            select cf.codi, cf.nome, sum(ep.tota_nf) as TOTAL from entr_prod ep
            left join clieforn cf ON cf.codi = ep.forn
            where ep.data >= '${formatInitialDate}' and ep.data <= '${formatFinishDate}'
            and ep.empr = ${dbUserptions.empr}
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
