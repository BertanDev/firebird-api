import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import bcrypt from 'bcrypt'
// import { AuthMiddleware } from '../../middlewares/AuthMiddleware'

interface RegisterBody {
  email: string
  password: string
  confirm_password: string
  database_path: string
  database_ip: string
  name: string
  cnpj: string
  user_firebird: string
  firebird_password: string
  aws_folder: string
  use_backup: boolean
}

export const Register = async (app: FastifyInstance) => {
  app.post(
    '/register',
    async (
      req: FastifyRequest<{ Body: RegisterBody }>,
      reply: FastifyReply,
    ) => {
      const {
        email,
        password,
        confirm_password,
        database_ip,
        database_path,
        name,
        cnpj,
        user_firebird,
        firebird_password,
        aws_folder,
        use_backup,
      } = req.body

      // Busca se já tem um email igual cadastrado
      const emailVerify = await prismaClient.user.findUnique({
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

      await prismaClient.user.create({
        data: {
          email,
          encrypted_password: hashedPassword,
          database_ip: use_backup ? 'localhost' : database_ip,
          firebird_path_database: use_backup
            ? `${process.env.BACKUP_LOCAL}/dbs/${aws_folder}/DADOS.FDB`
            : database_path,
          name,
          cnpj,
          firebird_user: use_backup ? 'SYSDBA' : user_firebird,
          firebird_password: use_backup ? 'masterkey' : firebird_password,
          aws_folder,
          use_backup,
        },
      })

      return reply.send({
        success: true,
        message: 'Usuário registrado com sucesso!',
      })
    },
  )
}
