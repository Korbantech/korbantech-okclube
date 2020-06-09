import connection from '../src/helpers/connection'

( async () => {

  console.log( 'create tables' )

  await connection

    .schema
    .dropTableIfExists( 'associates_phones' )
    .dropTableIfExists( 'associates_addresses' )
    .dropTableIfExists( 'associates' )

    .dropTableIfExists( 'benefits' )
    .dropTableIfExists( 'benefits_categories' )

    .dropTableIfExists( 'users' )
    .dropTableIfExists( 'users_types' )

    .createTableIfNotExists( 'users_types', table => {
      table.bigIncrements()
      table.string( 'name' )
    } )

    .createTableIfNotExists( 'users', table => {
      table.bigIncrements()
      table.string( 'mail' )
      table.string( 'name' )
      table.string( 'pass' )
      table.bigInteger( 'type' ).unsigned().references( 'users_types.id' )
      table.timestamps( true, true )
    } )

    .createTableIfNotExists( 'benefits_categories', table => {
      table.bigIncrements()
      table.string( 'name' )
    } )

    .createTableIfNotExists( 'benefits', table => {
      table.bigIncrements()
      table.string( 'title' )
      table.integer( 'discount' )
      table.text( 'description' )
      table.bigInteger( 'category' ).unsigned().references( 'benefits_categories.id' )
    } )

    .createTableIfNotExists( 'associates', table => {
      table.bigIncrements()
      table.string( 'name' )
      table.string( 'logo' )
      table.text( 'description' )
      table.bigInteger( 'club_nd_id' ).unique().unsigned()
      table.bigInteger( 'benefit' ).unsigned().references( 'benefits.id' )
      table.timestamp( 'deleted_at' )
      table.timestamps( true, true )
    } )

    .createTableIfNotExists( 'associates_addresses', table => {
      table.bigIncrements()
      table.string( 'address' )
      table.bigInteger( 'associated' ).unsigned().references( 'associates.id' )
    } )

    .createTableIfNotExists( 'associates_phones', table => {
      table.bigIncrements()
      table.string( 'phone' )
      table.bigInteger( 'associated' ).unsigned().references( 'associates.id' )
    } )
  
    .then( () => { console.log( 'create all tables' ) } )

    .catch( ( reason: Error ) => { console.log( reason.message ) } )

  connection.destroy()
} )()
