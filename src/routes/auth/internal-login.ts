import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

interface LoginBody {
  email: string
  password: string
}

export const InternalLogin = async (app: FastifyInstance) => {
  app.post(
    '/internal-login',
    async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { email, password } = req.body

      const user = await prismaClient.internalUsers.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado.' })
      }

      const verify_password = await bcrypt.compare(
        password,
        user.encrypted_password,
      )

      if (!verify_password) {
        return reply.status(401).send({ message: 'Senha incorreta.' })
      }

      const token = jwt.sign(
        { user_id: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '365d' },
      )

      return reply.status(200).send({ token })
    },
  )
}
