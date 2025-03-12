import { FastifyInstance } from 'fastify'

//* * Rota de teste */

export const TestRoute = async (app: FastifyInstance) => {
  app.get('/test-route', async (_, reply) => {
    reply.status(200).send('Test Route OK!')
  })
}
