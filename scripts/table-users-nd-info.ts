import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'users_nd_info' )
  .createTableIfNotExists( 'users_nd_info', table => {
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.string( 'code' )
    table.string( 'tel' )
    table.string( 'zip_code' )
    table.string( 'document' ) 
    table.string( 'address' )
    table.string( 'contract' )
    table.timestamp( 'valid' )
  } )
  .then( () => { console.log( 'create' ) } )
  .catch( ( { message } ) => { console.error( message ) } )
  .finally( () => connection.destroy() )
