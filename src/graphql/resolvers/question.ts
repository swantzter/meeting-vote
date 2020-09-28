import { Arg, FieldResolver, ID, Mutation, Publisher, PubSub, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql'
import { pool } from '../../db'
import Session from '../../db/entities/session'
import Question from '../../db/entities/question'

@Resolver(Question)
export default class QuestionResolver {
  private pool = pool

  @Mutation(returns => Question)
  async createQuestion (
    @PubSub('QUESTIONS') publish: Publisher<Question>,
    @Arg('sessionId', type => ID) sessionId: string,
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

  @Mutation(returns => Question)
  async openQuestion (
    @PubSub('QUESTIONS') publish: Publisher<Question>,
    @Arg('sessionId', type => ID) sessionId: string,
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

    questionInstance.openedAt = new Date()

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @Mutation(returns => Question)
  async closeQuestion (
    @PubSub('QUESTIONS') publish: Publisher<Question>,
    @Arg('sessionId', type => ID) sessionId: string,
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

    questionInstance.closedAt = new Date()

    const savedQuestion = await questionsRepo.save(questionInstance)
    await publish(savedQuestion)
    return savedQuestion
  }

  @FieldResolver(returns => Session)
  async session (@Root() question: Question): Promise<Session> {
    const connection = await this.pool
    const sessionsRepo = connection.getRepository(Session)

    return sessionsRepo.findOne(question.sessionId) as Promise<Session>
  }

  @Subscription({
    topics: 'QUESTIONS',
    filter: ({ payload, args }: ResolverFilterData<Question>) => args.sessionId === payload.sessionId
  })
  questionSubscription (@Root() question: Question, @Arg('sessionId', type => ID) sessionId: string): Question {
    return question
  }
}
