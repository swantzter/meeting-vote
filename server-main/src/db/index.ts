import { ConnectionOptions, createConnection } from 'typeorm'
const ormConfig: ConnectionOptions = require('../ormconfig')

export const pool = createConnection(ormConfig)
