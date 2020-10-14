import bcrypt from 'bcrypt'

import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'admin_users' )
  .createTableIfNotExists( 'admin_users', table => {
    table.bigIncrements()
    table.string( 'name' ).notNullable()
    table.string( 'email' ).notNullable().unique()
    table.text( 'password' ).notNullable()
    table.timestamps( true, true )
    table.timestamp( 'deleted_at' )
  } )
  .then( () => bcrypt.hash( 'admin', 12 ) )
  .then( password => ( { password, email: 'admin@admin.com', name: 'Administrador' } ) )
  .then( user => connection( 'admin_users' ).insert( user ) )
  .then( () => console.log( 'create user' ) )
  .catch( reason => console.error( reason ) )
  .finally( () => connection.destroy() )
