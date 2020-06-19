import connection from '../src/helpers/connection'

connection
  .schema
  .dropTableIfExists( 'polls' )
  .dropTableIfExists( 'polls_responses' )
  .dropTableIfExists( 'polls_comments' )
  .createTableIfNotExists( 'polls', table => {
    table.bigIncrements()
    table.text( 'text' ).notNullable()
    table.bigInteger( 'program' ).unsigned().notNullable()
    table.timestamps()
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
    table.timestamps()
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
        comment: 'Achei que a jarra traz um ar de descontração para o programa, acho que deve permanecer'
      } )

    await connection( 'polls_responses' )
      .insert( {
        poll,
        user: 1,
        response: 'yes'
      } )
  } )
  .catch( reason => {
    console.log( reason )
    connection.destroy()
  } )
