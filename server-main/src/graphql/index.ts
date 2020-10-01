import { buildSchemaSync as buildSchema, AuthChecker } from 'type-graphql'
import QuestionResolver from './resolvers/question'
import SessionResolver from './resolvers/session'
import VoteResolver from './resolvers/vote'
import { GooglePubSub } from '@axelspringer/graphql-google-pubsub'
import dateParser from '../helpers/json-date'
import { AuthLevels } from '../helpers/enums'
import auth from 'basic-auth'
import { ApolloServer, AuthenticationError } from 'apollo-server'
import { pool } from '../db'
import Voter from '../db/entities/voter'
import Session from '../db/entities/session'
import bcrypt from 'bcrypt'
import VoterResolver from './resolvers/voter'
import dataloaders from '../helpers/dataloaders'

const sessionCache = new Map<string, Pick<Session, 'adminPassword' | 'audiencePassword'>>()

export interface Context {
  voter?: Voter
  sessionId?: string
  role?: AuthLevels
  loaders: ReturnType<typeof dataloaders>
}

const authChecker: AuthChecker<Context, AuthLevels> = async ({ context }, roles) => {
  if (!context.role) return false
  return roles.includes(context.role)
}

export const schema = buildSchema({
  resolvers: [QuestionResolver, SessionResolver, VoteResolver, VoterResolver],
  dateScalarMode: 'timestamp',
  authChecker,
  pubSub: new GooglePubSub(
    undefined,
    topicName => `${topicName}-subscription`,
    ({ data }) => JSON.parse(data.toString(), dateParser)
  )
})

export async function context (context: any): Promise<Context> {
  let authMode, creds, session
  if (context.connection) { // it's a subscription!
    context.sessionId = context.connection.context['session-id']
    authMode = context.connection.context['auth-mode']
    creds = auth.parse(context.connection.context.authorization)
  } else {
    context.sessionId = context.req.get('session-id')
    authMode = context.req.get('auth-mode')
    creds = auth(context.req)
  }
  context.audience = false
  context.voter = false
  context.admin = false

  if (authMode) {
    if (!context.sessionId) throw new AuthenticationError('No session id provided to auth to')

    session = sessionCache.get(context.sessionId)
    if (!session) {
      const connection = await pool
      const sessionRepo = connection.getRepository(Session)
      session = await sessionRepo.findOne({ where: { id: context.sessionId }, select: ['adminPassword', 'audiencePassword'] })
      if (!session) throw new AuthenticationError('Session not found')
      sessionCache.set(context.sessionId, session)
    }

    if (authMode === AuthLevels.ADMIN) {
      if (!creds) throw new AuthenticationError('No Basic auth provided')
      const passwordMatch = await bcrypt.compare(creds.pass, session.adminPassword)
      if (!passwordMatch) throw new AuthenticationError('Incorrect Password')

      context.role = AuthLevels.ADMIN
    } else if (authMode === AuthLevels.VOTER) {
      if (!creds) throw new AuthenticationError('No Basic auth provided')

      const connection = await pool
      const voterRepo = connection.getRepository(Voter)

      context.voter = await voterRepo.findOne({ where: { id: creds.name, sessionId: context.sessionId } })
      if (!context.voter) throw new AuthenticationError('No such voter or session')

      const passwordMatch = await bcrypt.compare(creds.pass, context.voter.key)
      if (!passwordMatch) throw new AuthenticationError('Incorrect Password')

      context.role = AuthLevels.VOTER
    } else if (authMode === AuthLevels.AUDIENCE) {
      if (session.audiencePassword) {
        if (!creds) throw new AuthenticationError('No Basic auth provided')

        const passwordMatch = await bcrypt.compare(creds.pass, session.audiencePassword)
        if (!passwordMatch) throw new AuthenticationError('Incorrect Password')
      }

      context.role = AuthLevels.AUDIENCE
    }
  }

  context.loaders = dataloaders(pool)

  return context
}

export const server = new ApolloServer({
  schema,
  playground: true,
  tracing: true,
  context,
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      // make connectionParams our connection context so we can work with it in the context generator
      return connectionParams
    }
  }
  // cors: {} // TODO https://github.com/expressjs/cors#configuration-options
})
