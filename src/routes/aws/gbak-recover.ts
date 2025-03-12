import { FastifyInstance } from 'fastify'
import { prismaClient } from '../../lib/PrismaInit'
import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { promisify } = require('util')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = promisify(require('child_process').exec)

//* * Rota da aws */

export const GBAKRecover = async (app: FastifyInstance) => {
  app.get('/gbak-recover', async (request, reply) => {
    const { userId } = request.query as { userId: string }

    const user = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
    })

    fs.unlink(
      `${process.env.BACKUP_LOCAL}\\dbs\\${user?.aws_folder}\\DADOS.FDB`,
      (erro) => {
        console.log(erro)
        console.log('Backup deletado')
      },
    )

    let DBRestore = `gbak -c -v -REP -user sysdba -password masterkey ${process.env.BACKUP_LOCAL}/dbs/${user?.aws_folder}/DADOS.BKP `

    DBRestore += `${process.env.BACKUP_LOCAL}/dbs/${user?.aws_folder}/DADOS.FDB`

    console.log('--->>', DBRestore, '<<---')

    async function restoreDatabase() {
      try {
        const { stdout, stderr } = await exec(DBRestore, {
          cwd: process.env.FIREBIRD_PATH,
          maxBuffer: 1024 * 1024 * 1024,
        })
        console.log('stdout: ', stdout)
        console.error('stderr: ', stderr)
      } catch (error) {
        console.error('Erro ao executar o comando:', error)
      }
    }

    await restoreDatabase()

    await new Promise((resolve) => {
      setTimeout(resolve, 5 * 1000) // Aguarda 5 segundos
    })

    fs.unlink(
      `${process.env.BACKUP_LOCAL}\\dbs\\${user?.aws_folder}\\DADOS.BKP`,
      (erro) => {
        console.log(erro)
        console.log('Backup deletado')
      },
    )

    return reply.status(200).send('GBAK Recover OK!')
  })
}
