import connection from './helpers/connection'

( async () => {
  const users = await connection( 'users' )
    .column( 'users.id' )
    .innerJoin( 'users_metas', 'users_metas.user', 'users.id' )
    .where( 'users_metas.key', 'newspapers' )
    .where( clause => {
      clause.where( 'users_metas.value', 'true' )
      clause.orWhere( 'users_metas.value', '1' )
    } )

  console.log( users )

  process.exit()
} )()
