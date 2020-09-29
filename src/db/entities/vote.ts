import { Field, GraphQLTimestamp as Timestamp, ID, ObjectType, registerEnumType } from 'type-graphql'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { DateTransformer } from '../helpers'
import Question from './question'
import Voter from './voter'

export enum VoteOptions {
  YES = 'yes',
  NO = 'no',
  ABSTAIN = 'abstain'
}

registerEnumType(VoteOptions, {
  name: 'VoteOptions'
})

@Entity()
@ObjectType()
export default class Vote {
  @PrimaryGeneratedColumn('increment')
  @Field(type => ID)
  id!: number

  @Column({ type: 'enum', enum: VoteOptions })
  @Field(type => VoteOptions)
  vote!: VoteOptions

  @Column('timestamp', { transformer: DateTransformer })
  @Field(type => Timestamp)
  createdAt!: Date

  @ManyToOne(type => Question, question => question.votes)
  @Field(type => Question)
  question!: Question

  @Column()
  questionId!: number

  // who voted for what is secret - no @Field()
  @ManyToOne(type => Voter, voter => voter.votes)
  voter!: Voter

  @Column()
  voterId!: number
}
