import { messaging } from 'firebase-admin'

import firebase from '../helpers/firebase'
import firestoreCollectionToArray from './firestoreCollectionToArray'
import splitLotArray from './splitLotArray'

const sendNotification = ( { filter, ...notification }: sendNotification.Options ) =>
  firestoreCollectionToArray.collection( 'users' )
    .then( users => {
      return Promise.all( users.map( filter ) )
        .then( allows => {
          const allowedUsers = users.filter( ( user, index ) => allows[index] || !user.token )
          const sends = splitLotArray( 500, allowedUsers ).map( ( users ) => {
            const tokens = users.map( user => user.token )
            return firebase.messaging().sendToDevice( tokens, notification )
              .then( async response => {
                const processingErrors: Promise<any>[] = response.results.map( ( result, index ) => {
                  if ( result.error && result.error.code === 'messaging/registration-token-not-registered' )
                    if ( result.error.code === 'messaging/registration-token-not-registered' )
                      return firebase.firestore().collection( 'users' ).doc( users[index].doc ).delete()
                  return Promise.resolve()
                } )
                try { await Promise.all( processingErrors ) } catch ( e ) { /* empty */ }
                return response
              } )
          } )
          return Promise.all( sends )
        } )
    } )

namespace sendNotification {
  export interface Options extends messaging.MessagingPayload {
    filter( user: any ): Promise<boolean> | boolean
  }
}

export default sendNotification
