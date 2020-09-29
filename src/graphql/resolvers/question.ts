import { Arg, Authorized, Ctx, FieldResolver, ID, Mutation, Publisher, PubSub, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql'
import { pool } from '../../db'
import Session from '../../db/entities/session'
import Question from '../../db/entities/question'
import Vote from '../../db/entities/vote'
import { ApolloError } from 'apollo-server'
import { AuthLevels } from '../../helpers/enums'
import { Context } from '..'

@Resolver(Question)
export default class QuestionResolver {
  private pool = pool

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async createQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('question') question: string
  ): Promise<Question | undefined> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    const questionInstance = questionsRepo.create({
      question,
      sessionId
    })

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async openQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('questionId', type => ID) questionId: number
  ): Promise<Question | undefined> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    const questionInstance = await questionsRepo.findOneOrFail({
      where: {
        id: questionId,
        sessionId
      }
    })

    if (questionInstance.openedAt) throw new ApolloError('Already Opened', 'ALREADY_OPENED')

    questionInstance.openedAt = new Date()

    console.log(questionInstance)

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @Authorized(AuthLevels.ADMIN)
  @Mutation(returns => Question)
  async closeQuestion (
    @PubSub('questions') publish: Publisher<Question>,
    @Ctx() { sessionId }: Context,
    @Arg('questionId', type => ID) questionId: number
  ): Promise<Question | undefined> {
    const connection = await this.pool
    const questionsRepo = connection.getRepository(Question)

    // TODO: mark all other as absentees + transactions

    const questionInstance = await questionsRepo.findOneOrFail({
      where: {
        id: questionId,
        sessionId
      }
    })

    if (!questionInstance.openedAt) throw new ApolloError('Not Yet Opened', 'NOT_OPENED')
    if (questionInstance.closedAt) throw new ApolloError('Already Closed', 'ALREADY_CLOSED')

    questionInstance.closedAt = new Date()

    console.log(questionInstance)

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @FieldResolver(returns => Session)
  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  async session (@Root() question: Question): Promise<Session> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    return sessionsRepo.findOne(question.sessionId) as Promise<Session>
  }

  @FieldResolver(returns => [Vote])
  async votes (@Root() question: Question): Promise<Vote[]> {
    const connection = await this.pool
    const voteRepo = connection.getRepository(Vote)

    return voteRepo.find({ where: { question } })
  }

  @Authorized(AuthLevels.ADMIN, AuthLevels.VOTER, AuthLevels.AUDIENCE)
  @Subscription({
    topics: 'questions',
    filter: ({ payload, args }: ResolverFilterData<Question>) => args.sessionId === payload.sessionId
  })
  questionSubscription (@Root() question: Question, @Arg('sessionId', type => ID) sessionId: string): Question {
    console.log(question)
    return question
  }
}
