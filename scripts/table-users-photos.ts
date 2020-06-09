import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'users_photos' )
  .createTableIfNotExists( 'users_photos', table => {
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.string( 'photo' ) 
  } )
  .then( () => { console.log( 'create' ) } )
  .catch( ( { message } ) => { console.error( message ) } )
  .finally( () => connection.destroy() )
