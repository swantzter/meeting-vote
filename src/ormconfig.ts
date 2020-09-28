import 'reflect-metadata'
import 'dotenv/config'
import { ConnectionOptions } from 'typeorm'
import { join as pjoin } from 'path'

import Session from './db/entities/session'
import Question from './db/entities/question'

const config: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT as number | undefined ?? 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  logger: 'advanced-console',
  cache: false,
  entities: [Session, Question],

  migrations: [pjoin(__dirname, '/db/migrations/*{.js,.ts}')],
  cli: {
    migrationsDir: 'src/db/migrations'
  }
}

module.exports = config
