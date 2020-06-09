import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'newspaper_editions' )
  .dropTableIfExists( 'newspaper_edition' )
  .dropTableIfExists( 'newspaper' )
  .dropTableIfExists( 'newspapers' )

  .createTableIfNotExists( 'newspapers', table => {
    table.bigIncrements()
    table.timestamps()
    table.string( 'name' )
  } )

  .createTableIfNotExists( 'newspaper_editions', table => {
    table.bigIncrements()
    table.timestamps()
    table.bigInteger( 'newspaper' ).unsigned().references( 'newspapers.id' )

    table.string( 'name' )
    table.string( 'ed_maven_number' ).unique()
    table.timestamp( 'screening_date' )
    table.string( 'pdf_file_path' )
    table.string( 'png_file_path' )
    table.string( 'png_url' )
    table.string( 'pdf_url' )
    table.integer( 'pages_count' )
  
    table.boolean( 'public' ).defaultTo( true )
  } )

  .then( () => console.log( 'create tables success' ) )
  .catch( reason => console.error( reason.message ) )
  .finally( () => connection.destroy() )
