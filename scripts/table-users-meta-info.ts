import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'users_meta_info' )
  .createTableIfNotExists( 'users_meta_info', table => {
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.string( 'facebook_uri' )
    table.string( 'instagram_uri' )
    table.string( 'twitter_uri' )
    table.timestamp( 'birthday' ) 
  } )
  .then( () => { console.log( 'create' ) } )
  .catch( ( { message } ) => { console.error( message ) } )
  .finally( () => connection.destroy() )
