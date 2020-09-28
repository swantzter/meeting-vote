import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Question from './question'

@Entity()
@ObjectType()
export default class Session {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  id!: string;

  @Column()
  @Field()
  name!: string

  @OneToMany(type => Question, question => question.session)
  @Field(type => [Question])
  questions!: Question[]
}
