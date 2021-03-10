import { hash } from 'bcrypt'
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'

@Entity()
export class Admin {
  @PrimaryGeneratedColumn( 'increment', { type: 'bigint', unsigned: true } ) id: number
  @Column( { unique: true } ) email: string
  @Column() password: string

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date
  @DeleteDateColumn() deletedAt: Date | null
  @Column( 'timestamp', { nullable: true } ) logedAt: Date | null

  @BeforeInsert()
  @BeforeUpdate()
  protected async hashedPassword() {
    if ( !/^\$2[a-b]\$12$/.test( this.password ) )
      this.password = await hash( this.password, 12 )
  }
}
