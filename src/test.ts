import firebase from 'firebase-admin'
import path from 'path'

( async () => {
  process.env.GOOGLE_APPLICATION_CREDENTIALS =
    path.resolve( 'data', 'grupo-nd-temporario-firebase-adminsdk-oxxno-f784900986.json' )

  const app = firebase.initializeApp( {
    credential: firebase.credential.applicationDefault()
  } )

  try {
    const users = await firebase.firestore( app ).collection( 'users' ).get()
    users.forEach( async user => {
      firebase.messaging( app ).sendToDevice( user.get( 'tokens' ), {
        notification: {
          title: 'Teste',
          body: 'Corpo teste'
        }
      } )
        .then( response => {
          console.log( 'Success to send:', response )
        } )
        .catch( reason => {
          console.log( 'Error:', reason )
        } )
    } )
  } catch ( e ) {
    console.log( 'Error: ', e.message )
    process.exit( 1 )
  }
} )()
