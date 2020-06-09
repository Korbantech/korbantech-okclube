import connection from '../src/helpers/connection'

( async ( req, res ) => {
  const limit = parseInt( req.query?.per?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' )
  const order = req.query?.order?.toString() || 'id'
  const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
  const like: null | string = req.query?.like?.toString() || null
  const excluded: 'on' | 'only' | 'true' | null =
    req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

  const user: string | null = req.query?.user?.toString() || null

  const query = connection( 'benefits_categories' )
    .select( 'benefits_categories.*' )
    .limit( limit )
    .offset( page * limit )
    .orderBy( order, orderType )

  if ( !excluded ) { /* query.whereNull( 'deleted_at' ) */ }

  if ( excluded === 'only' ) { /* query.whereNotNull( 'deleted_at' ) */ }

  if ( like ) query.where( 'name', 'like', `%${like}%` )

  if ( user )
    query
      .leftJoin( 'favorite_categories', clause => {
        // @ts-ignore
        clause.on( 'favorite_categories.user', '=', parseInt( user, 10 ) )
          .andOn( 'favorite_categories.category', '=', 'benefits_categories.id' )
      } )
      .column( connection.raw( 'CASE WHEN favorite_categories.user IS NULL THEN 0 ELSE 1 END AS favorite' ) )

  try {
    res.json( await query )
  } catch ( e ) {
    console.error( e )
  } finally {
    connection.destroy()
  }

} )( { query: {
  user: 2
} as any }, { json: console.log } )
