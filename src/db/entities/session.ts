import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Question from './question'
import User from './user'

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

  @ManyToMany(type => User, user => user.sessions)
  admins!: User[]
}
