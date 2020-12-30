import connection from '../src/helpers/connection'

connection
  .schema
  .createTableIfNotExists( 'coupons', table => {
    table.bigIncrements()
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.bigInteger( 'associate' ).unsigned().references( 'associate.id' )
    table.string( 'coupon' )
    table.timestamp( 'created_at' ).defaultTo( connection.raw( 'CURRENT_TIMESTAMP()' ) )
  } )
  .then( () => { console.log( 'create' ) } )
  .catch( ( { message } ) => { console.error( message ) } )
  .finally( () => connection.destroy() )
