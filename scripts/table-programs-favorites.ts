import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'favorite_programs' )
  .createTableIfNotExists( 'favorite_programs', table => {
    table.bigInteger( 'program' ).unsigned().notNullable()
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
  } )
  .then( () => {} )
  .catch( () => {} )
  .finally( () => {
    connection.destroy()
  } )
