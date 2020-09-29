import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql'
import bcrypt from 'bcrypt'
import { pool } from '../../db'
import Question from '../../db/entities/question'
import Session from '../../db/entities/session'
import { AuthLevels } from '../../helpers/enums'
import { Context } from '..'

@Resolver(Session)
export default class SessionResolver {
  private pool = pool

  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  @Query(returns => Session, { nullable: true })
  async session (@Ctx() { sessionId }: Context): Promise<Session | undefined> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    return sessionsRepo.findOne({ where: { id: sessionId } })
  }

  @Mutation(returns => Session)
  async createSession (
    @Arg('name') name: string,
    @Arg('adminPassword') adminPassword: string,
    @Arg('audiencePassword', { nullable: true }) audiencePassword?: string
  ): Promise<Session | undefined> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    const session = sessionsRepo.create({
      name,
      adminPassword: await bcrypt.hash(adminPassword, 10),
      audiencePassword: audiencePassword ? await bcrypt.hash(adminPassword, 10) : undefined
    })

    return sessionsRepo.save(session)
  }

  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  @FieldResolver(returns => [Question])
  async questions (@Root() session: Session): Promise<Question[]> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    return (await questionsRepo.find({ where: { session } })) ?? []
  }
}
