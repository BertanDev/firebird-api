import { FastifyInstance } from 'fastify'
import fs from 'fs'
import fsp from 'node:fs/promises'
import { api } from '../../lib/axiosInit'
import dayjs from 'dayjs'
import { prismaClient } from '../../lib/PrismaInit'
import {
  GetObjectCommand,
  S3Client,
  ListObjectsCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import Seven from 'node-7z'
import sevenBin from '7zip-bin'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { promisify } = require('util')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const exec = promisify(require('child_process').exec)

//* * Rota da aws */

export const AwsRoute = async (app: FastifyInstance) => {
  app.get('/aws-route', async (request, reply) => {
    const { userId } = request.query as { userId: string }

    const downloadFile = async (url: string, localPath: string) => {
      try {
        const response = await api({
          url,
          method: 'GET',
          responseType: 'stream',
        })

        // Salvar o arquivo localmente
        await response.data.pipe(fs.createWriteStream(localPath))

        return await new Promise((resolve, reject) => {
          response.data.on('end', () => resolve(''))
          response.data.on('error', (err: string) => reject(err))
        })
      } catch (error) {
        console.error('Erro ao baixar o arquivo:', error)
      }
    }

    const { aws_folder, id } = (await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        aws_folder: true,
        id: true,
      },
    })) as {
      aws_folder: string
      id: string
    }

    const s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_KEY as string,
      },
    })

    // Listar todos os backups do cliente
    const MMYYYY = dayjs(new Date()).format('MM-YYYY')

    const params = {
      Bucket: 'bkpclientes',
      Prefix: `${MMYYYY}/${aws_folder}/`,
    }

    const objects = new ListObjectsCommand(params)

    const resObjects = await s3Client.send(objects)

    let mostRecentObject
    if (resObjects.Contents) {
      // Pega o backup mais recente
      mostRecentObject = resObjects.Contents[resObjects.Contents.length - 1]
    }

    const getObjectURL = async (key: string) => {
      const command = new GetObjectCommand({
        Bucket: 'bkpclientes',
        Key: key,
      })

      const url = await getSignedUrl(s3Client, command)
      return url
    }

    let objectKey = ''
    if (mostRecentObject) {
      objectKey = mostRecentObject.Key as string
    }

    const regexGBAK = /\/([^/]*\/)(?=.*?GBAK)/

    const isGBAK = regexGBAK.test(objectKey)

    // Pegar a data do backup para salvar no banco
    const match = objectKey.match(/(\d{2}-\d{2}-\d{4}_\d{2}-\d{2}-\d{2})/)
    const dataString = match ? match[1] : null

    // Extrair partes da string de data
    if (dataString) {
      const [day, hours] = dataString.split('_')
      const [dia, mes, ano] = day.split('-')
      const [hora, minuto, segundo] = hours.split('-')

      // Construir a data no formato desejado
      const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}.000Z`

      const finallyDate = new Date(dataFormatada)

      const lastBackup = await prismaClient.user.findFirst({
        where: {
          aws_folder,
        },
        select: {
          last_backup_date: true,
        },
      })

      if (dayjs(lastBackup?.last_backup_date).isSame(finallyDate)) {
        return reply.status(200).send('AWS Route OK! No download')
      }

      await prismaClient.user.updateMany({
        data: {
          last_backup_date: finallyDate,
        },
        where: {
          aws_folder,
        },
      })
    }

    const url = await getObjectURL(objectKey)

    const localPath = `temporaryDatabases/${aws_folder}.7z`

    await downloadFile(url, localPath)
      .then(() => {
        console.log('Arquivo baixado com sucesso!')
      })
      .catch((err) => {
        console.error('Erro:', err)
      })

    // Caminho para a sua pasta
    const tmpFolder = `/home/dashboard-app/adm-sistemas-api/temporaryDatabases/${aws_folder}.7z`

    // Comando chmod para conceder permissões 777 à pasta
    const tmpCommand = `sudo chmod 777 ${tmpFolder}`

    // Executar o comando no sistema operacional
    exec(tmpCommand, (erro: { message: any }, stdout: any, stderr: any) => {
      if (erro) {
        console.error(`Erro ao executar o comando: ${erro.message}`)
        return
      }
      if (stderr) {
        console.error(`Erro ao executar o comando: ${stderr}`)
        return
      }
      console.log(`Permissões alteradas com sucesso para ${tmpFolder}`)
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 5 * 1000) // Aguarda 5 segundos
    })

    const zipFilePath = `temporaryDatabases/${aws_folder}.7z`
    const extractToPath = `dbs/${aws_folder}`

    const pathTo7zip = sevenBin.path7za

    const myStream = Seven.extractFull(zipFilePath, extractToPath, {
      $bin: pathTo7zip,
    })

    myStream.on('data', (data) => {
      console.log('Data:', data)
    })

    myStream.on('end', () => {
      console.log('Extração concluída com sucesso!')
    })

    myStream.on('error', (err) => {
      console.error('Erro durante a extração:', err)
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 5 * 1000) // Aguarda 5 segundos
    })

    async function renomearArquivo(origem: string, destino: string) {
      try {
        // Renomeia o arquivo
        await fsp.rename(origem, destino)
      } catch (err) {
        console.error('Erro ao renomear o arquivo:', err)
      }
    }

    // Constrói os caminhos completos para os arquivos
    const origem = `${process.env.BACKUP_LOCAL}/dbs/${aws_folder}/DADOS.BKP`
    const destino = `${process.env.BACKUP_LOCAL}/dbs/${aws_folder}/DADOS.FDB`

    // Chama a função para renomear o arquivo quando não é GBAK
    if (!isGBAK) {
      await renomearArquivo(origem, destino)
    }

    if (isGBAK) {
      await api.get('http://localhost:8080/gbak-recover', {
        params: {
          userId: id,
        },
      })
    }

    // Caminho para a sua pasta
    const fdbFolder = `/home/dashboard-app/adm-sistemas-api/dbs/${aws_folder}/DADOS.FDB`

    // Comando chmod para conceder permissões 777 à pasta
    const fdbCommand = `sudo chmod 777 ${fdbFolder}`

    // Executar o comando no sistema operacional
    exec(fdbCommand, (erro: { message: any }, stdout: any, stderr: any) => {
      if (erro) {
        console.error(`Erro ao executar o comando: ${erro.message}`)
        return
      }
      if (stderr) {
        console.error(`Erro ao executar o comando: ${stderr}`)
        return
      }
      console.log(`Permissões alteradas com sucesso para ${fdbFolder}`)
    })

    // Caminho para a sua pasta
    const dbsFolder = `/home/dashboard-app/adm-sistemas-api/dbs/${aws_folder}`

    // Comando chmod para conceder permissões 777 à pasta
    const dbsCommand = `sudo chmod 777 ${dbsFolder}`

    // Executar o comando no sistema operacional
    exec(dbsCommand, (erro: { message: any }, stdout: any, stderr: any) => {
      if (erro) {
        console.error(`Erro ao executar o comando: ${erro.message}`)
        return
      }
      if (stderr) {
        console.error(`Erro ao executar o comando: ${stderr}`)
        return
      }
      console.log(`Permissões alteradas com sucesso para ${dbsFolder}`)
    })

    return reply.status(200).send('AWS Route OK!' + url)
  })
}
