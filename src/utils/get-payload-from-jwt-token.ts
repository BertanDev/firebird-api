import jwt from 'jsonwebtoken'

function getPayloadFromToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.error('JWT_SECRET não está definido no ambiente.')
    return null
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    return decoded as { user_id: string; empr: number }
  } catch (error) {
    console.error('Erro ao decodificar o token:', error)
    return null
  }
}

export { getPayloadFromToken }
