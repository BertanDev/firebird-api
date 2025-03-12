import { app } from '../../server.js'
import { CashAccount } from './cash-account'
import { CountPaidThisMonth } from './count-paid-this-month.js'
import { MovementsLastTwelveMonths } from './movements-last-twelve-months'
import { TotalBalance } from './total-balance'
import { TotalBalanceCurrentMonth } from './total-balance-current-month'
import { TotalByDayRange } from './total-by-day-range.js'
import { TotalCreditMovementsCurrentMonth } from './total-credit-movements-current-month'
import { TotalDebitMovementsCurrentMonth } from './total-debit-movements-current-month'
import { TotalReceivable } from './total-receivable'
import { TotalReceivableCurrentMonth } from './total-receivable-current-month'
import { TotalToPay } from './total-to-pay'
import { TotalToPayCurrentMonth } from './total-to-pay-current-month'

const FinancialRoutes = async () => {
  app.register(MovementsLastTwelveMonths)
  app.register(TotalReceivable)
  app.register(TotalToPay)
  app.register(TotalReceivableCurrentMonth)
  app.register(TotalToPayCurrentMonth)
  app.register(TotalBalance)
  app.register(TotalBalanceCurrentMonth)
  app.register(CashAccount)
  app.register(TotalCreditMovementsCurrentMonth)
  app.register(TotalDebitMovementsCurrentMonth)
  app.register(TotalByDayRange)
  app.register(CountPaidThisMonth)
}

export { FinancialRoutes }
