import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'

//* * Retorna o total de vendas de todos os vendedores  */

type SalesData = {
  ANO: string
  MES: string
  NOME: string
  C_FUNC: number
  TOTAL_PEDIDOS: number
}[]

type OrganizedDataItem = {
  ANO: string
  MES: string
  TOTAL_PEDIDOS: number
}

export const TotalSalesSeller = async (app: FastifyInstance) => {
  app.get(
    '/total-sales-seller',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      const sql = `
            SELECT
            c_func,
            fu.nome,
            EXTRACT(MONTH FROM data) AS mes,
            EXTRACT(YEAR FROM data) AS ano,
            CASE WHEN COUNT(*) = 0 THEN 0 ELSE COUNT(*) END AS total_pedidos
            FROM pedi_vend
            left join func fu ON fu.codi = c_func
            WHERE data >= CURRENT_DATE - 365
            AND empr = ${dbUserptions.empr}
            GROUP BY c_func, nome, mes, ano
            ORDER BY c_func, nome, ano, mes;
        `

      try {
        const result = (await queryDatabase(sql, dbUserptions)) as SalesData

        // Obter uma lista única de todos os meses e anos presentes nos dados
        const uniqueMonths = Array.from(
          new Set(result.map((item) => `${item.ANO}-${item.MES}`)),
        )

        // Organizar os dados por funcionário
        const organizedData = result.reduce(
          (acc, item) => {
            const funcKey = item.NOME
            if (!acc[funcKey]) {
              acc[funcKey] = []
            }
            acc[funcKey].push({
              ANO: item.ANO,
              MES: item.MES,
              TOTAL_PEDIDOS: item.TOTAL_PEDIDOS,
            })
            return acc
          },
          {} as Record<string, OrganizedDataItem[]>,
        )

        // Preencher os meses ausentes com 0
        Object.values(organizedData).forEach((funcData) => {
          uniqueMonths.forEach((month) => {
            const [ano, mes] = month.split('-')
            const found = funcData.find(
              (item) => item.ANO == ano && item.MES == mes,
            )
            if (!found) {
              funcData.push({ ANO: ano, MES: mes, TOTAL_PEDIDOS: 0 })
            }
          })

          // Ordenar os dados do funcionário por ano e mês
          funcData.sort((a: OrganizedDataItem, b: OrganizedDataItem) => {
            const anoComparison = parseInt(a.ANO) - parseInt(b.ANO)
            if (anoComparison !== 0) {
              return anoComparison
            }

            return parseInt(a.MES) - parseInt(b.MES)
          })

          if (funcData.length === 13) {
            funcData.shift()
          }
        })

        // Criar o formato desejado
        const finalResult = Object.entries(organizedData).map(
          ([funcKey, funcData]) => {
            return {
              name: funcKey,
              data: funcData.map((item) => item.TOTAL_PEDIDOS),
            }
          },
        )

        return reply.status(200).send(finalResult)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
