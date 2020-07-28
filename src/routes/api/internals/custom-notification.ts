import Express from 'express'

import firebase from '../../../helpers/firebase'

const route = Express.Router()

const isNoAwait = ( req: any ) =>
  'no-await' in req.query ||
  'noAwait' in req.query ||
  'no-await' in req.body ||
  'noAwait' in req.body

route.post( '/custom-notification', async ( req, res ) => {
  try {

    const noAwait = isNoAwait( req )
    
    const users = await firebase.firestore().collection( 'users' ).get()

    const tokens: string[] = []

    users.forEach( user => tokens.push( user.get( 'token' ) ) )

    if ( noAwait ) return res.json( { send: true } )

    const message = await firebase.messaging().sendToDevice( tokens, {
      data: {
        type: req.body.section?.name,
        url: req.body.section?.url
      },
      notification: {
        title: req.body.title,
        body: req.body.body,
      }
    } )

    if ( !noAwait ) res.json( { success: message.successCount, failure: message.failureCount } )

  } catch ( e ) { res.json( { message: e.message } ) }
} )

route.post( '/custom-notification/new', async ( req, res ) => {
  try {

    const noAwait = isNoAwait( req )
    
    const users = await firebase.firestore().collection( 'users' ).get()

    const tokens: string[] = []

    users.forEach( user => tokens.push( user.get( 'token' ) ) )

    if ( noAwait ) return res.json( { send: true } )

    const message = await firebase.messaging().sendToDevice( tokens, {
      data: {
        type: 'new',
        url: req.body.url
      },
      notification: {
        title: req.body.title,
        body: req.body.body,
      }
    } )

    if ( !noAwait ) res.json( { success: message.successCount, failure: message.failureCount } )

  } catch ( e ) { res.json( { message: e.message } ) }
} )

export default route
