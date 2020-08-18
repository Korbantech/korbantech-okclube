import firebase from './helpers/firebase';

( async () => {
  const collections = await firebase.firestore().collection( 'users' ).get()
  let users: any[] = []
  collections.forEach( user => users.push( user.data() ) )

  const iosDevices = users.filter( user => user.platform === 'ios' )

  const tokens = iosDevices.map( user => user.token )
  const response = await firebase.messaging().sendToDevice( tokens, {
    notification: {
      title: 'Teste para ios',
      body: 'Apenas um teste para ios'
    }
  } )
  response.results.forEach( result => {
    console.log( result )
    if ( result.error )
      console.error( `Error: ${result.error.message}(${result.error.code})` )
  } )
  process.exit()
} )()
