import { app } from '../../server.js'
import { MostExpensiveProducts } from './most-expensive-products'
import { TopTenBestSellers } from './top-ten-best-sellers.js'
import { TotalProductsValue } from './total-products-value.js'
import { ProfitPerGroupProduct } from './profit-per-group-product.js'
import { GetAllGroupsProducts } from './get-all-groups-products.js'
import { ABCProducts } from './abc-products.js'

const ProductRoutes = async () => {
  app.register(MostExpensiveProducts)
  app.register(TopTenBestSellers)
  app.register(TotalProductsValue)
  app.register(ProfitPerGroupProduct)
  app.register(GetAllGroupsProducts)
  app.register(ABCProducts)
}

export { ProductRoutes }
