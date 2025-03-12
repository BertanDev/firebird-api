import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import dayjs from 'dayjs'

interface ConfirmRecoverBody {
  recover_token: string
}

export const ConfirmRecover = async (app: FastifyInstance) => {
  app.post(
    '/confirm-recover',
    async (
      req: FastifyRequest<{ Body: ConfirmRecoverBody }>,
      reply: FastifyReply,
    ) => {
      const { recover_token } = req.body

      const user = await prismaClient.user.findUnique({
        where: {
          recover_password_token: recover_token,
        },
      })

      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      const currentDate = dayjs().toISOString()

      if (
        dayjs(currentDate).subtract(30, 'minutes') >
        dayjs(user.expire_date_token)
      ) {
        return reply.status(401).send({ message: 'Token expired' })
      }

      await prismaClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          encrypted_password: user.recovered_password as string,
          recovered_password: null,
          expire_date_token: null,
          recover_password_token: null,
        },
      })

      return reply.status(201).send({ message: 'Senha recuperada!' })
    },
  )
}
