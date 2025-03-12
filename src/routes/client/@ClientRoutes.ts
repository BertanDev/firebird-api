import { app } from '../../server.js'
import { ABCClients } from './abc-clients.js'
import { AllClients } from './all-clients.js'
import { CountClientsBuyThisMonth } from './count-clients-buy-this-month.js'
import { CountClientsPerState } from './count-clients-per-state.js'
import { ProductsPerClient } from './products-per-client.js'
import { TotalClientsWithLateBills } from './total-clients-with-late-bills.js'
import { TotalNewClientsInThisMonth } from './total-new-clients-in-this-month.js'
import { TotalRegisteredClient } from './total-registered-client'

const ClientRoutes = async () => {
  app.register(TotalClientsWithLateBills)
  app.register(TotalRegisteredClient)
  app.register(TotalNewClientsInThisMonth)
  app.register(CountClientsBuyThisMonth)
  app.register(CountClientsPerState)
  app.register(ABCClients)
  app.register(AllClients)
  app.register(ProductsPerClient)
}

export { ClientRoutes }
