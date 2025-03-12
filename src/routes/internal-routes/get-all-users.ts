import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import { AuthMiddleware } from '../../middlewares/AuthMiddleware'

export const GetAllUsers = async (app: FastifyInstance) => {
  app.get(
    '/get-all-users',
    app.addHook('preValidation', AuthMiddleware),
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { user_id } = req.query as { user_id: string }

      if (!user_id) {
        const users = await prismaClient.user.findMany({
          select: {
            id: true,
            email: true,
            database_ip: true,
            name: true,
            firebird_path_database: true,
          },
        })

        return reply.status(200).send(users)
      }

      const user = await prismaClient.user.findUnique({
        where: {
          id: user_id,
        },
        select: {
          id: true,
          email: true,
          database_ip: true,
          name: true,
          firebird_path_database: true,
          cnpj: true,
          firebird_user: true,
          firebird_password: true,
          aws_folder: true,
          use_backup: true,
        },
      })

      return reply.status(200).send(user)
    },
  )
}
