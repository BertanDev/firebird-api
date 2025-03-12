// import { readConfig } from './readConfig'

export type DbOptions = {
  host?: string
  port?: number
  database?: string
  user?: string
  password?: string
  lowercase_keys?: boolean
  role?: string | undefined
  pageSize?: number
  retryConnectionInterval?: number
  blobAsText?: boolean
  empr?: number
  // encoding: string;
}

const dbOptions = {
  // host: '',
  database: '',
  // host: '177.38.13.145',
  // database: 'C:\\ADMERP\\DADOS.FDB',
  // database: 'C:\\ADMERP\\DADOS-adm-ultima.FDB'
  host: 'localhost',
  // database: await readConfig('BASE');
  port: 3050,
  user: 'SYSDBA',
  // password: 'masterkey',
  password: 'masterkey',
  lowercase_keys: false, // set to true to lowercase keys
  role: undefined, // default
  // pageSize: 4096;        // default when creating database
  // pageSize: 4096;        // default when creating database
  retryConnectionInterval: 1000, // reconnect interval in case of connection drop
  blobAsText: false, // set to true to get blob as text, only affects blob subtype 1
  // encoding: 'UTF-8'; // default encoding for connection is UTF-8
  empr: 0,
} as DbOptions

// async function configConnection() {

// }

// configConnection()

export { dbOptions }
