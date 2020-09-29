import { Field, ID, ObjectType } from 'type-graphql'
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import Session from './session'
import Vote from './vote'

@Entity()
@ObjectType()
export default class Voter {
  @PrimaryColumn()
  @Field(type => ID)
  id!: string

  // does this need to be a password hash? nah probably not
  // should it be salted? eh, maybe
  @Column({ length: 60, type: 'char' })
  // no need to show this in gql
  key!: string

  @OneToMany(type => Vote, vote => vote.voter)
  votes!: Vote[]

  @ManyToOne(type => Session, session => session.voters)
  session!: Session

  @Column()
  sessionId!: string
}
