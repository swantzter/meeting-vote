import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Question from './question'
import Voter from './voter'
import { Matches } from 'class-validator'

@Entity()
@ObjectType()
export default class Session {
  @PrimaryGeneratedColumn('uuid')
  @Field(type => ID)
  id!: string;

  @Column()
  @Field()
  @Matches(/^[\w\d\s-?!]+$/i)
  name!: string

  @Column({ length: 60, type: 'char' })
  adminPassword!: string

  @Column({ length: 60, type: 'char', nullable: true })
  audiencePassword?: string

  @OneToMany(type => Question, question => question.session)
  @Field(type => [Question])
  questions!: Question[]

  @OneToMany(type => Voter, voter => voter.session)
  @Field(type => [Voter])
  voters!: Voter[]
}
