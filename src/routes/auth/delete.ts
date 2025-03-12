import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'

interface DeleteBody {
  id: string
}

export const Delete = async (app: FastifyInstance) => {
  app.delete(
    '/delete',
    async (req: FastifyRequest<{ Body: DeleteBody }>, reply: FastifyReply) => {
      const { id } = req.body

      const idVerify = await prismaClient.user.findUnique({
        where: {
          id,
        },
      })

      if (!idVerify) {
        return reply.status(400).send({ message: 'Usuário não encontrado' })
      }

      await prismaClient.user.delete({
        where: {
          id,
        },
      })

      return reply.send({
        success: true,
        message: 'Usuário excluído com sucesso!',
      })
    },
  )
}
