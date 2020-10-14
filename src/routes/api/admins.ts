import connection from '@helpers/connection'
import bcrypt from 'bcrypt'
import { Router, Handler } from 'express'
import jwt from 'jsonwebtoken'

const admins = Router()

export const auth: Handler = ( req: any, res, next ) => {
  const auth = req.header( 'authorization' )
  if ( !auth ) return res.status( 401 ).json()

  const data = jwt.decode( auth ) as any
  if ( !data ) return res.status( 401 ).json()

  connection( 'admin_users' )
    .where( 'id', data.id )
    .first()
    .then( user => req.user = user )
    .then( () => next() )
    .catch( () => res.status( 500 ).json() )
}

admins.route( '/admins/auth' )
  .post( ( req, res, next ) => {
    connection( 'admin_users' )
      .where( 'admin_users.email', req.body.email )
      .first()
      .then( user => {
        if ( !user ) return res.status( 404 ).json()
        return bcrypt.compare( req.body.password, user.password )
          .then( equal => {
            if ( !equal ) return res.status( 401 ).json()
            const token = jwt.sign( { id: user.id }, 'byBqZWFuIMOpIHVtIHB1dGEgY3V6w6Nv==WFuIMOpIHV' )
            return res.json( { ...user, token } )
          } )
      } )
      .catch( next )
  } )

export default admins
