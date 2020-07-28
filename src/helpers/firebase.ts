import firebaseAdmin from 'firebase-admin'
import path from 'path'

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  path.resolve( 'data', 'grupo-nd-temporario-firebase-adminsdk-oxxno-f784900986.json' )

const firebase = firebaseAdmin.initializeApp( {
  credential: firebaseAdmin.credential.applicationDefault()
} )

export default firebase
