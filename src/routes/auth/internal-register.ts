import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import bcrypt from 'bcrypt'

interface RegisterBody {
  email: string
  password: string
  confirm_password: string
}

export const InternalRegister = async (app: FastifyInstance) => {
  app.post(
    '/internal-register',
    async (
      req: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply,
    ) => {
      const { email, password, confirm_password } = req.body

      // Busca se já tem um email igual cadastrado
      const emailVerify = await prismaClient.internalUsers.findUnique({
        where: {
          email,
        },
      })

      // Se já tiver um email igual ele não prossegue com o cadastro
      if (emailVerify) {
        return reply.status(400).send({ message: 'Email ja cadastrado' })
      }

      if (password !== confirm_password) {
        return reply.status(400).send({ message: 'As senhas não conferem' })
      }

      const hashedPassword = await bcrypt.hash(password, 8)

      await prismaClient.internalUsers.create({
        data: {
          email,
          encrypted_password: hashedPassword,
        },
      })

      return reply.send({
        success: true,
        message: 'Usuário registrado com sucesso!',
      })
    },
  )
}
