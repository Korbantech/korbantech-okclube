import { User as UserBrige } from '@bridges/User'
import { hash } from 'bcrypt'
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  AfterInsert,
  ManyToMany,
  JoinTable
} from 'typeorm'

import { Device } from './Device'

@Entity()
export class User {
  @PrimaryGeneratedColumn( 'increment', { type: 'bigint', unsigned: true } ) id: number
  @Column( { unique: true } ) email: string
  @Column() name: string
  @Column() password: string

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date
  @DeleteDateColumn() deletedAt: Date | null
  @Column( 'timestamp', { nullable: true } ) logedAt: Date | null

  @Column( { unique: true } ) document: string

  @Column( { nullable: true } ) phone: string | null
  @Column( { nullable: true } ) zipCode: string | null
  @Column( { nullable: true } ) address: string | null

  @Column( { nullable: true } ) subscriptionCode: number
  @Column( { nullable: true } ) subscriptionContract: string
  @Column( { nullable: true } ) subscriptionValidity: Date
  @Column( { nullable: true } ) subscriptionType: string

  @Column( { nullable: true } ) facebook: string | null
  @Column( { nullable: true } ) instagram: string | null
  @Column( { nullable: true } ) twitter: string | null

  @Column( { nullable: true } ) photo: string | null

  @ManyToMany( () => Device )
  @JoinTable()
  devices: Device

  @AfterInsert()
  protected async searchSubscription() {
    await UserBrige.prototype.updateSubscription.call( this )
    await UserBrige.prototype.save.call( this )
  }
  @BeforeInsert()
  @BeforeUpdate()
  protected async hashedPassword() {
    if ( this.password && !/^\$2[a-b]\$12$/.test( this.password ) )
      this.password = await hash( this.password, 12 )
  }
}
