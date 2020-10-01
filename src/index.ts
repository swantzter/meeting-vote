import 'reflect-metadata'
import 'dotenv/config'
import { server } from './graphql'

// Start the server
server.listen(process.env.PORT ?? 80).then(({ url }) => {
  console.log(`Server is running, GraphQL Playground available at ${url}`)
})
