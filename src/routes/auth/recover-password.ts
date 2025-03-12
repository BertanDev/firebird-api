import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import bcrypt from 'bcrypt'
import dayjs from 'dayjs'
import { randomUUID } from 'crypto'
import { transponder } from '../../lib/nodemailer-adm'

interface RecoverPasswordBody {
  email: string
  password: string
  confirm_password: string
}

export const RecoverPassword = async (app: FastifyInstance) => {
  app.post(
    '/recover-password',
    async (
      req: FastifyRequest<{ Body: RecoverPasswordBody }>,
      reply: FastifyReply,
    ) => {
      const { email, confirm_password, password } = req.body

      const user = await prismaClient.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return reply.status(400).send({ message: 'Usuário não encontrado' })
      }

      if (confirm_password !== password) {
        return reply.status(400).send({ message: 'As senhas diferem' })
      }

      const hashedPassword = await bcrypt.hash(password, 8)
      const currentDate = dayjs().toISOString()
      const recover_token = randomUUID()

      await prismaClient.user.update({
        where: {
          id: user.id,
        },
        data: {
          recovered_password: hashedPassword,
          expire_date_token: currentDate,
          recover_password_token: recover_token,
        },
      })

      await transponder.sendMail({
        from: 'adminfo@adminfo.com.br',
        to: 'joaobertan.xxe@gmail.com',
        subject: 'Recuperação de senha',
        text:
          'Clique no link a seguir para confirmar a mudança de sua senha: ' +
          `${process.env.WEB_IP}/api/recover-password?t=${recover_token}`,
        html: '',
      })

      return reply
        .status(201)
        .send({ message: `Email de recuperação enviado para ${user.email}` })
    },
  )
}
