import { app } from '../../server.js'
import { Login } from './login.js'
import { Register } from './register.js'
import { InternalRegister } from './internal-register.js'
import { InternalLogin } from './internal-login.js'
import { Update } from './update.js'
import { Delete } from './delete.js'
import { RecoverPassword } from './recover-password.js'
import { ConfirmRecover } from './confirm-recover.js'

const AuthRoutes = async () => {
  app.register(Login)
  app.register(Register)
  app.register(InternalRegister)
  app.register(InternalLogin)
  app.register(Update)
  app.register(Delete)
  app.register(RecoverPassword)
  app.register(ConfirmRecover)
}

export { AuthRoutes }
