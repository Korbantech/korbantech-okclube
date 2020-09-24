import connection from '../src/helpers/connection'

( async ( req, res ) => {
  const limit = parseInt( req.query?.per?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' )
  const order = req.query?.order?.toString() || 'id'
  const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
  const like: null | string = req.query?.like?.toString() || null
  const excluded: 'on' | 'only' | 'true' | null =
    req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null
  const categories = req.query?.categories?.toString().split( ',' ) ?? []
  const favorite: string | null = req.query?.favorite?.toString() || null
  const user: string | null = req.query?.user?.toString() || null

  const query = connection( 'associates' )
    .select(
      'associates.*',
      'benefits.title AS benefit_title',
      'benefits_categories.name AS benefit_category',
      'benefits.discount AS benefit_discount',
      connection.raw( 'GROUP_CONCAT( associates_addresses.address SEPARATOR \'|\' ) AS address' ),
      connection.raw( 'GROUP_CONCAT( associates_phones.phone SEPARATOR \'|\' ) AS phones' ),
    )
    .limit( limit )
    .leftJoin( 'associates_addresses', 'associates_addresses.associated', 'associates.id' )
    .leftJoin( 'associates_phones', 'associates_phones.associated', 'associates.id' )
    .join( 'benefits', 'benefits.id', 'associates.id' )
    .join( 'benefits_categories', 'benefits.category', 'benefits_categories.id' )
    .offset( page * limit )
    .orderBy( order, orderType )
    .groupBy( 'associates.id' )

  if ( favorite )
    query.join( 'favorite_associates', 'favorite_associates.associated', 'associates.id' )
      .where( 'favorite_associates.user', '=', user || favorite )

  if ( user && !favorite )
    query
      .leftJoin( 'favorite_associates', clause => {
        // @ts-ignore
        clause.on( 'favorite_associates.user', '=', parseInt( user, 10 ) )
          .andOn( 'favorite_associates.associated', '=', 'associates.id' )
      } )
      .column( connection.raw( 'CASE WHEN favorite_associates.user IS NULL THEN 0 ELSE 1 END AS favorite' ) )

  if ( !excluded ) query.whereNull( 'deleted_at' )

  if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

  if ( like ) query.where( 'associates.name', 'like', `%${like}%` )

  if ( categories.length ) query.whereIn( 'benefits_categories.id', categories )

  return res.json( ( await query ).map( row => ( {
    ...row,
    address: row.address?.split( '|' ) || [],
    phones: row.phones?.split( '|' ) || [],
    discount: row.benefit_discount,
    category: row.benefit_category,
    favorite: row.favorite !== undefined ? Boolean( row.favorite ) : undefined
  } ) ) )
} )( {} as any, { json: ( ...args: any[] ) => { console.log( args ) } } as any )
