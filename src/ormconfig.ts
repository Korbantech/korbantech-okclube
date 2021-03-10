
import Logger from '@tools/typeorm/Logger'
import { NamingStrategySnakeCase } from '@tools/typeorm/NamingStrategy'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConnectionOptions } from 'typeorm'

const development = process.env.NODE_ENV === 'development'

const folder = development ? 'src' : 'src'

const extension = development ? 'ts' : 'ts'

const options: ConnectionOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: Number( process.env.MYSQL_PORT ),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  synchronize: true,
  entities: [ `${folder}/entities/**/*.${extension}` ],
  migrations: [ `${folder}/migration/**/*.${extension}` ],
  subscribers: [ `${folder}/subscriber/**/*.${extension}` ],
  cli: {
    entitiesDir: `${folder}/entities`,
    migrationsDir: `${folder}/migration`,
    subscribersDir: `${folder}/subscriber`
  },
  logging: true,
  logger: new Logger(),
  namingStrategy: new NamingStrategySnakeCase(),
  dropSchema: true
}

export default options
