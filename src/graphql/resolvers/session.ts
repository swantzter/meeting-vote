import { Arg, FieldResolver, ID, Mutation, Query, Resolver, Root } from 'type-graphql'
import { pool } from '../../db'
import Question from '../../db/entities/question'
import Session from '../../db/entities/session'

@Resolver(Session)
export default class SessionResolver {
  private pool = pool

  @Query(returns => Session, { nullable: true })
  async session(@Arg('id', type => ID) id: string): Promise<Session | undefined> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    return sessionsRepo.findOne({ where: { id } })
  }

  @Mutation(returns => Session)
  async createSession(@Arg('name') name: string): Promise<Session | undefined> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    const session = sessionsRepo.create({
      name
    })

    return sessionsRepo.save(session)
  }

  @FieldResolver(returns => [Question])
  async questions(@Root() session: Session): Promise<Question[]> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    return (await questionsRepo.find({ where: { session } })) ?? []
  }
}
