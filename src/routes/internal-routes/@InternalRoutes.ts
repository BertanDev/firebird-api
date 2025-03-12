import { app } from '../../server'
import { GetAllUsers } from './get-all-users'
import { GetCountTotalUsers } from './get-count-total-users'

const InternalRoutes = async () => {
  app.register(GetAllUsers)
  app.register(GetCountTotalUsers)
}

export { InternalRoutes }
