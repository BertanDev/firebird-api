import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { dbOptions } from '../../FIREBIRD/connection'
import { queryDatabase } from '../../baseQuery'

interface LoginBody {
  email: string
  password: string
  empr: number
}

export const Login = async (app: FastifyInstance) => {
  app.post(
    '/login',
    async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { email, password, empr } = req.body

      const user = await prismaClient.user.findUnique({
        where: {
          email,
        },
      })

      if (!user) {
        return reply.status(404).send({ message: 'Usuário não encontrado.' })
      }

      if (!empr || typeof empr !== 'number') {
        return reply.status(404).send({ message: 'Empresa não informada.' })
      }

      const verify_password = await bcrypt.compare(
        password,
        user.encrypted_password,
      )

      if (!verify_password) {
        return reply.status(401).send({ message: 'Senha incorreta.' })
      }

      const loginOptions = { ...dbOptions }

      loginOptions.host = user.database_ip
      loginOptions.database = user.firebird_path_database
      loginOptions.user = user.firebird_user as string
      loginOptions.password = user.firebird_password as string

      const token = jwt.sign(
        { user_id: user.id, empr },
        process.env.JWT_SECRET as string,
        { expiresIn: '30d' },
      )

      if (user.use_backup) {
        // await api.get('http://localhost:8080/aws-route', {
        //   params: {
        //     userId: user.id,
        //   },
        // })
      } else {
        const sql = `SELECT FIRST(1) RAZAO FROM DADOS_EMPRE WHERE CODI = ${empr} `

        const razao_empre = await queryDatabase(sql, loginOptions)

        if (!razao_empre) {
          return reply
            .status(405)
            .send({ message: 'Base de dados inoperante.' })
        }
      }

      return reply.status(200).send({ token })
    },
  )
}
