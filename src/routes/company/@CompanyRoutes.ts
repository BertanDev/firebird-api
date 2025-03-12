import { app } from '../../server.js'
import { Employees } from './employees'
import { EmployeesFullData } from './employees-full-data'

const CompanyRoutes = async () => {
  app.register(Employees)
  app.register(EmployeesFullData)
}

export { CompanyRoutes }
