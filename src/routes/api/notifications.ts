import { IS_PRODUCTION_ENVIRONMENT } from '@constants/index'
import connection from '@helpers/connection'
import sendNotification from '@tools/sendNotification'
import { Router } from 'express'

import { auth } from './admins'

const notifications = Router()

notifications.route( '/notifications' )
  .get( ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const offset = limit * page
    const order = req.query?.order?.toString() || 'created_at'

    connection( 'notifications' )
      .select( 'notifications.*' )
      .select( connection.raw( `
        JSON_OBJECT(
          'id', admin_users.id,
          'name', admin_users.name,
          'email', admin_users.email,
          'created_at', admin_users.created_at,
          'updated_at', admin_users.updated_at,
          'deleted_at', admin_users.deleted_at
        ) AS user
      ` ) )
      .innerJoin( 'admin_users', 'admin_users.id', 'notifications.created_by' )
      .limit( limit )
      .offset( offset )
      .orderBy( order )
      .then( ( notifications: any[] ) => notifications.map(
        notification => ( { ...notification, user: JSON.parse( notification.user ) } )
      ) )
      .then( res.json.bind( res ) )
  } )
  .post(
    auth,
    ( req, res ) => {
      // @ts-ignore
      const user = req.user
      console.log( user )
      sendNotification( {
        filter: user => user.id === 1 || IS_PRODUCTION_ENVIRONMENT,
        notification: {
          title: req.body.title,
          body: req.body.body,
        }
      } )
        .then( async data => {
          const counts = data.reduce( ( data, message ) => {
            data.failure += message.failureCount
            data.success += message.successCount
            return data
          }, { success: 0, failure: 0 } )

          const notification = {
            title: req.body.title,
            body: req.body.body,
            ...counts,
            created_by: user.id
          }

          return connection( 'notifications' ).insert( notification )
            .then( () => notification )
        } )
        .then( res.json.bind( res ) )
        .catch( reason => res.json( { message: reason.message } ) )
    } )

export default notifications
