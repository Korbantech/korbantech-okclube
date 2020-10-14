import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'notifications' )
  .createTableIfNotExists( 'notifications', table => {
    table.bigIncrements()
    table.string( 'title' ).notNullable()
    table.text( 'body' ).notNullable()
    table.bigInteger( 'created_by' ).unsigned().references( 'admin_users.id' )
    table.integer( 'success' ).defaultTo( 0 )
    table.integer( 'failure' ).defaultTo( 0 )
    table.timestamps( true, true )
  } )
  .then( () => console.log( 'create' ) )
  .catch( reason => console.error( reason ) )
  .finally( () => connection.destroy() )
