import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'pass_recover' )
  .createTableIfNotExists( 'pass_recover', table => {
    table.integer( 'code' ).unsigned().notNullable()

    table.bigInteger( 'user' ).unsigned().notNullable().references( 'users.id' )

    table.timestamps( true, true )

    table.timestamp( 'used_at' )

    table.timestamp( 'checked_at' )
  } )
  .then( () => console.log( 'create' ) )
  .catch( reason => console.log( 'error', reason.message ) )
  .finally( () => connection.destroy() )
