import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'users_metas' )
  .createTableIfNotExists( 'users_metas', table => {
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.string( 'key' ).notNullable()
    table.text( 'value' ).notNullable()
  } )
  .then( () => { console.log( 'create' ) } )
  .catch( ( { message } ) => { console.error( message ) } )
  .finally( () => connection.destroy() )
