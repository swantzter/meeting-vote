import { Field, ObjectType } from 'type-graphql'
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import Question from './question'
import Voter from './voter'

@Entity()
@ObjectType()
export default class VoterBlock {
  @PrimaryColumn()
  questionId!: number

  @PrimaryColumn()
  voterId!: string

  @ManyToOne(type => Question)
  @Field()
  question!: Question

  @ManyToOne(type => Voter)
  @Field()
  voter!: Voter
}
