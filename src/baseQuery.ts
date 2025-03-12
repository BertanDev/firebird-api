import Firebird, { Database } from 'node-firebird'
import { DbOptions } from './FIREBIRD/connection'

const connectWithRetry = async (dbOptions: DbOptions): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const tryConnect = async () => {
      Firebird.attach(dbOptions, (error, db) => {
        if (error) {
          console.log(error)
          // if (error.code === 'ETIMEDOUT') {
          //   reject(error)
          // }
          setTimeout(tryConnect, 1) // Tenta novamente após 1 milisegundos
        } else {
          resolve(db)
        }
      })
    }

    tryConnect()
  })
}

export const queryDatabase = async (sql: string, dbOptions: DbOptions) => {
  try {
    let db: Database | null = null
    let result: Array<object> = []

    // Tenta conectar até que tenha sucesso
    while (!db) {
      db = await connectWithRetry(dbOptions)
    }

    // Agora, com a conexão bem-sucedida, executa a consulta
    if (db) {
      result = await new Promise((resolve, reject) => {
        db!.query(sql, [], (error, queryResult) => {
          if (error) {
            reject(error)
          } else {
            resolve(queryResult)
          }
        })
      })
    }

    // Finaliza a conexão
    db!.detach()

    if (result.length === 1) {
      return result[0]
    } else {
      return result
    }
  } catch (error) {
    console.error('Erro na consulta:', error)
  }
}
