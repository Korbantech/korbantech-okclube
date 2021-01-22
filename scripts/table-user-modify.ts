import connection from '@helpers/connection'

connection
  .schema
  .alterTable( 'users', table => {
    table.bigInteger( 'partnerships_network_id' ).unique().nullable()
  } )
  .finally( () => connection.destroy() )
