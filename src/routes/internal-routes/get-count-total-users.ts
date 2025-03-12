import { FastifyInstance, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'

export const GetCountTotalUsers = async (app: FastifyInstance) => {
  app.get(
    '/get-count-total-users',
    app.addHook('preValidation', AuthMiddleware),
    async (_, reply: FastifyReply) => {
      const users = await prismaClient.user.count()

      return reply.status(200).send(users)
    },
  )
}
