import { dbOptions } from '../FIREBIRD/connection'
import { prismaClient } from '../lib/PrismaInit'
import { getPayloadFromToken } from './get-payload-from-jwt-token'

export async function getDataBaseOptions(headers: string | undefined) {
  if (!headers) {
    return 'Authorization header missing'
  }

  const authorization = headers.replace('Bearer ', '')

  const payload = getPayloadFromToken(authorization)

  const user = await prismaClient.user.findFirst({
    where: {
      id: payload?.user_id,
    },
    select: {
      database_ip: true,
      firebird_path_database: true,
      firebird_user: true,
      firebird_password: true,
    },
  })

  if (!user) {
    return
  }

  const userDbOptions = dbOptions

  userDbOptions.host = user.database_ip
  userDbOptions.database = user.firebird_path_database
  userDbOptions.user = user.firebird_user as string
  userDbOptions.password = user.firebird_password as string
  userDbOptions.empr = payload?.empr

  return userDbOptions
}
