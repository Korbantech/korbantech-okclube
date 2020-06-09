import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'favorite_associates' )
  .dropTableIfExists( 'favorite_categories' )
  .createTableIfNotExists( 'favorite_associates', table => {
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.bigInteger( 'associated' ).unsigned().references( 'associates.id' )
  } )
  .createTableIfNotExists( 'favorite_categories', table => {
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.bigInteger( 'category' ).unsigned().references( 'benefits_categories.id' )
  } )
  .then( () => {
    console.log( 'create favorites table' )
  } )
  .catch( ( reason ) => {
    console.error( `Error: ${reason.message}` )
  } )
  .finally( () => {
    connection.destroy()
  } )
