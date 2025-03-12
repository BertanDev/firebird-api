import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o total de vendas do PV em dinheiro dos últimos doze meses separado por mês  */

interface TotalPorMes {
  MES: number
  ANO: number
  TOTAL: number
}

export const LastTwelveMonthsSales = async (app: FastifyInstance) => {
  app.get(
    '/last-twelve-months-sales',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const sql = `
      SELECT
        EXTRACT(MONTH FROM pv.DATA) AS MES,
        EXTRACT(YEAR FROM pv.DATA) AS ANO,
        SUM(pv.total) AS TOTAL
        FROM pedi_vend pv
        WHERE
        pv.data >= CURRENT_DATE - 365
        and pv.empr = ${dbUserptions.empr}
        GROUP BY
        EXTRACT(MONTH FROM pv.data),
        EXTRACT(YEAR FROM pv.data)
        ORDER BY
        ANO DESC, MES DESC;
      `

      try {
        const result = (await queryDatabase(sql, dbUserptions)) as TotalPorMes[]

        for (const resultado of result) {
          const { MES, ANO } = resultado
          const existente = result.find((m) => m.MES === MES && m.ANO === ANO)

          if (existente) {
            existente.TOTAL += resultado.TOTAL
          } else {
            result.push(resultado)
          }
        }

        const hoje = new Date()
        const ultimosDozeMeses: TotalPorMes[] = []
        for (let i = 0; i < 12; i++) {
          const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
          ultimosDozeMeses.push({
            MES: data.getMonth() + 1,
            ANO: data.getFullYear(),
            TOTAL: 0,
          })
        }

        // Adicionar os últimos doze meses se ainda não existirem
        for (const ultimoMes of ultimosDozeMeses) {
          const existente = result.find(
            (m) => m.MES === ultimoMes.MES && m.ANO === ultimoMes.ANO,
          )

          if (!existente) {
            result.push(ultimoMes)
          }
        }

        // Ordenar por ano e mês
        result.sort((a, b) => {
          if (a.ANO !== b.ANO) {
            return b.ANO - a.ANO
          }
          return b.MES - a.MES
        })

        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
