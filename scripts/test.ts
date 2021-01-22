/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import firebase from '@helpers/firebase'
( async () => {
  const query = await firebase.firestore().collection( 'users' ).get()

  const data = query.docs.map( doc => doc.data() ).filter( data => !!data.id ).find( data => data.id === 481 )

  console.log( data )
} )()
