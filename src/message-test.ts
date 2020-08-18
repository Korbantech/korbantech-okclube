import connection from './helpers/connection'

( async () => {
  await connection( 'polls' ).insert( {
    text: 'Teste para Grande Florianópolis',
    location: 'grande-florianopolis'
  } )
  await connection( 'polls' ).insert( {
    text: 'Teste para Blumenau e região',
    location: 'blumenau-e-regiao"'
  } )
  await connection( 'polls' ).insert( {
    text: 'Teste para Joinville e região',
    location: 'norte'
  } )
  connection.destroy()
} )()
