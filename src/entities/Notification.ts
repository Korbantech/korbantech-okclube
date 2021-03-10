import { User } from '@bridges/User'
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  AfterInsert
} from 'typeorm'

import { Admin } from './Admin'

@Entity()
export class Notification {
  @PrimaryGeneratedColumn( 'increment', { type: 'bigint', unsigned: true } ) id: number

  @Column() title: string
  @Column( { nullable: true } ) tag: string | null
  @Column( { nullable: true } ) badge: string | null
  @Column( { nullable: true } ) body: string | null
  @Column( { nullable: true } ) bodyLocArgs: string | null
  @Column( { nullable: true } ) bodyLocKey: string | null
  @Column( { nullable: true } ) clickAction: string | null
  @Column( { nullable: true } ) color: string | null
  @Column( { nullable: true } ) icon: string | null
  @Column( { nullable: true } ) sound: string | null
  @Column( { nullable: true } ) titleLocArgs: string | null
  @Column( { nullable: true } ) titleLocKey: string | null
  
  @Column() received: number
  @Column() lost: number

  @ManyToOne( () => Admin )
  @JoinColumn() by: Admin

  @AfterInsert()
  protected async send() {
    const users = await User.find( {
      relations: [ 'devices' ],
      where: {
        'devices.online': true
      }
    } )
    console.log( users, this )
  }

  @CreateDateColumn() at: Date
}
