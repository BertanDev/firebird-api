import { FastifyInstance } from 'fastify'
import { queryDatabase } from '../../baseQuery'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'
import { DbOptions } from '../../FIREBIRD/connection'
import { getDataBaseOptions } from '../../utils/get-database-path'
import { getSharedProducts } from '../../utils/get-shared-products'

//* Retorna o custo, custo real, preço a vista e preço a prazo de todo o estoque */

export const TotalProductsValue = async (app: FastifyInstance) => {
  app.get(
    '/total-products-value',
    app.addHook('preValidation', AuthMiddleware),
    async (req, reply) => {
      const dbUserptions = (await getDataBaseOptions(
        req.headers.authorization,
      )) as DbOptions

      try {
        const sql = `select
          sum(pe.qtd * pc.cust_custo) as CUSTO,
          sum(pe.qtd * pc.cust_custo_real) as CUSTO_REAL,
          sum(CAST(pe.qtd AS BIGINT) * CAST(pc.cust_preco_vista AS BIGINT)) as PRECO_VISTA,
          sum(CAST(pe.qtd AS BIGINT) * CAST(pc.cust_preco_prazo AS BIGINT)) as PRECO_PRAZO
          from prod_custos pc
          left join prod_esto pe on pc.cust_prod_codi = pe.cod_prod and pc.cust_empr = pe.cod_empr
          left join prod pr on pc.cust_prod_codi = pr.codi
          where pr.ativo = 'S'
          and pe.qtd > 0
          AND PR.CODI NOT IN (SELECT PA.PROD_CODI_ASSOCIADO FROM PROD_ASSOCIACAO PA)
          AND PR.CODI_TIPO IN (0,1,2,3,4,5,6,10)
          `

        const result = await queryDatabase(sql, dbUserptions)
        return reply.status(200).send(result)
      } catch (error) {
        console.error('Error:', error)
      }
    },
  )
}
