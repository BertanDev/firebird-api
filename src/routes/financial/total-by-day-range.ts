import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { DbOptions } from '../../FIREBIRD/connection'
import dayjs, { Dayjs } from 'dayjs'

//* * Retorna o valor total a receber e a pagar por faixa de dias */

type sqlResult = {
  VENC: string
  SALD: number
  TIPO: string
}[]

export const TotalByDayRange = async (app: FastifyInstance) => {
  app.get(
    '/total-by-day-range',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      // 'tr' = retorna referente aos títulos a receber
      // 'tp' = retorna referente aos títulos a pagar
      const { type } = req.query as { type: 'tr' | 'tp' }

      try {
        let sql = `
        select tr.venc, tr.sald from titur tr
        where tr.sald > 0.01
        and tr.venc > CURRENT_DATE and empr = ${dbUserptions.empr}
		`

        const to_receive = (await queryDatabase(sql, dbUserptions)) as sqlResult

        sql = `
        select tp.venc, tp.sald from titup tp
        where tp.sald > 0.01
        and tp.venc > CURRENT_DATE and empr = ${dbUserptions.empr}
		`

        const to_pay = (await queryDatabase(sql, dbUserptions)) as Array<{
          VENC: string
          SALD: number
          TIPO: string
        }>

        // Função para calcular o intervalo de dias entre duas datas
        const differenceBetweenDays = (data1: Dayjs, data2: string) => {
          return Math.abs(dayjs(data1).diff(dayjs(data2), 'day'))
        }

        // Função para agrupar e somar os SALD em intervalos de 5 dias
        const groupInterval = (dados: sqlResult) => {
          const today = dayjs()
          const result = {
            '0 a 5 dias': 0,
            '6 a 10 dias': 0,
            '11 a 15 dias': 0,
            '16 a 20 dias': 0,
            '21 a 25 dias': 0,
            '26 a 30 dias': 0,
            'Acima de 30 dias': 0,
          }

          dados.forEach((item) => {
            const differenceDays = differenceBetweenDays(today, item.VENC)

            if (differenceDays >= 0 && differenceDays <= 5) {
              result['0 a 5 dias'] += item.SALD
            } else if (differenceDays > 5 && differenceDays <= 10) {
              result['6 a 10 dias'] += item.SALD
            } else if (differenceDays > 10 && differenceDays <= 15) {
              result['11 a 15 dias'] += item.SALD
            } else if (differenceDays > 15 && differenceDays <= 20) {
              result['16 a 20 dias'] += item.SALD
            } else if (differenceDays > 20 && differenceDays <= 25) {
              result['21 a 25 dias'] += item.SALD
            } else if (differenceDays > 25 && differenceDays <= 30) {
              result['26 a 30 dias'] += item.SALD
            } else if (differenceDays > 30) {
              result['Acima de 30 dias'] += item.SALD
            }
          })

          return result
        }

        // Chame a função e imprima o resultado
        const receive = groupInterval(to_receive)
        const pay = groupInterval(to_pay)

        if (type === 'tr') {
          return reply.status(200).send(receive)
        } else if (type === 'tp') {
          return reply.status(200).send(pay)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
