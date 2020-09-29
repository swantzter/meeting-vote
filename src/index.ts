import 'reflect-metadata'
import 'dotenv/config'
import { ApolloServer } from 'apollo-server'
import { schema, context } from './graphql'

const server = new ApolloServer({
  schema,
  playground: true,
  context
  // cors: {} // TODO https://github.com/expressjs/cors#configuration-options
})

// Start the server
server.listen(process.env.PORT ?? 80).then(({ url }) => {
  console.log(`Server is running, GraphQL Playground available at ${url}`)
})
