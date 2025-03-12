import { AuthRoutes } from './routes/auth/@AuthRoutes'
import { AwsRoute } from './routes/aws/dowload-db'
import { GBAKRecover } from './routes/aws/gbak-recover'
import { ClientRoutes } from './routes/client/@ClientRoutes'
import { CompanyRoutes } from './routes/company/@CompanyRoutes'
import { FinancialRoutes } from './routes/financial/@FinancialRoutes'
import { InternalRoutes } from './routes/internal-routes/@InternalRoutes'
import { ProductRoutes } from './routes/product/@ProductRoutes'
import { PurchaseRoutes } from './routes/purchase/@PurchaseRoutes'
import { SaleRoutes } from './routes/sale/@SaleRoutes'
import { SuppliersRoutes } from './routes/suppliers/@SuppliersRoutes'
import { TestRoute } from './routes/test-route'
import { app } from './server.js'

const routes = async () => {
  app.register(ClientRoutes)
  app.register(ProductRoutes)
  app.register(FinancialRoutes)
  app.register(SaleRoutes)
  app.register(CompanyRoutes)
  app.register(TestRoute)
  app.register(AuthRoutes)
  app.register(InternalRoutes)
  app.register(PurchaseRoutes)
  app.register(SuppliersRoutes)
  app.register(AwsRoute)
  app.register(GBAKRecover)
}

export { routes }
