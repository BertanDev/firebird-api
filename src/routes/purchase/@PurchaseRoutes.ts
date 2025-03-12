import { app } from '../../server'
import { LastTwelveMonthsPurchase } from './last-twelve-months-purchase'

const PurchaseRoutes = async () => {
  app.register(LastTwelveMonthsPurchase)
}

export { PurchaseRoutes }
