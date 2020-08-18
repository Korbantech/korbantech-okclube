import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'polls_responses' )
  .dropTableIfExists( 'polls_comments' )
  .dropTableIfExists( 'polls' )
  .createTableIfNotExists( 'polls', table => {
    table.bigIncrements()
    table.text( 'text' ).notNullable()
    table.bigInteger( 'program' ).unsigned()
    table.text( 'location' )
    table.timestamps( true, true )
    table.timestamp( 'deleted_at' )
  } )
  .createTableIfNotExists( 'polls_responses', table => {
    table.bigInteger( 'poll' ).unsigned().notNullable().references( 'polls.id' )
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.string( 'response' ).notNullable()
  } )
  .createTableIfNotExists( 'polls_comments', table => {
    table.bigInteger( 'poll' ).unsigned().notNullable().references( 'polls.id' )
    table.bigInteger( 'user' ).unsigned().references( 'users.id' )
    table.text( 'comment' )
    table.timestamps( true, true )
    table.timestamp( 'deleted_at' )
  } )
  .then( async () => {
    const ids = await connection( 'polls' )
      .insert( {
        text: 'Você acha que nossa jarra deve permanecer na bancada?',
        program: 183163
      } )
    const poll = ids[0]

    await connection( 'polls_comments' )
      .insert( {
        poll,
        user: 1,
        comment: 'Achei que a jarra traz um ar de descontração para o programa, acho que deve permanecer'
      } )

    await connection( 'polls_responses' )
      .insert( {
        poll,
        user: 1,
        response: 'yes'
      } )
    console.log( 'create and populate' )
    connection.destroy()
  } )
  .catch( reason => {
    console.log( reason )
    connection.destroy()
  } )
