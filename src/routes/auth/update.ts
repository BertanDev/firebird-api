import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
// import { AuthMiddleware } from '../../middlewares/AuthMiddleware'

interface RegisterBody {
  email: string
  database_path: string
  database_ip: string
  name: string
  cnpj: string
  id: string
  user_firebird: string
  firebird_password: string
  aws_folder: string
  use_backup: boolean
}

export const Update = async (app: FastifyInstance) => {
  app.post(
    '/update',
    async (
      req: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply,
    ) => {
      const {
        email,
        database_ip,
        database_path,
        name,
        cnpj,
        id,
        firebird_password,
        user_firebird,
        aws_folder,
        use_backup,
      } = req.body

      const idVerify = await prismaClient.user.findUnique({
        where: {
          id,
        },
      })

      if (!idVerify) {
        return reply.status(400).send({ message: 'Usuário não encontrado' })
      }

      await prismaClient.user.update({
        where: {
          id,
        },
        data: {
          email,
          database_ip,
          firebird_path_database: database_path,
          name,
          cnpj,
          firebird_user: user_firebird,
          firebird_password,
          aws_folder,
          use_backup,
        },
      })

      return reply.send({
        success: true,
        message: 'Usuário atualizado com sucesso!',
      })
    },
  )
}
