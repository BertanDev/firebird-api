import { app } from '../../server'
import { ABCSuppliers } from './abc-suppliers'

const SuppliersRoutes = async () => {
  app.register(ABCSuppliers)
}

export { SuppliersRoutes }
