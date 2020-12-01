import connection from '@helpers/connection'
import Express from 'express'


const route = Express.Router()


route.route( '/coupons/count' )
  .get( async ( req, res ) => {

    const sunday = new Date()
    sunday.setDate( sunday.getDate() - sunday.getDay() )

    const query = connection( 'coupons' )
      .select(
        connection.raw( 'COUNT( coupons_month.id ) AS month' ),
        connection.raw( 'COUNT( coupons_week.id ) AS week' ),
      )
      .leftJoin(
        connection( 'coupons' )
          .select( '*' )
          .where(
            connection.raw( 'MONTH(coupons.created_at) = MONTH( NOW() )' ),
          ).where(
            connection.raw( 'YEAR( coupons.created_at ) = YEAR( NOW() )' ),
          )
          .groupBy( 'coupons.id' )
          .as( 'coupons_month' ),
        'coupons.id', 'coupons.id'
      )
      .leftJoin(
        connection( 'coupons' )
          .select( '*' )
          .where(
            'coupons.created_at', '>=', sunday
          )
          .groupBy( 'coupons.id' )
          .as( 'coupons_week' ),
        'coupons_week.id', 'coupons.id'
      )
      .where(
        connection.raw( 'MONTH(coupons.created_at) = MONTH( NOW() )' ),
      ).where(
        connection.raw( 'YEAR( coupons.created_at ) = YEAR( NOW() )' ),
      )
      .groupBy( 'coupons.id' )
      .having( 'week', '>=', 0 )
      .having( 'month', '>=', 0 )
      .first()
    return res.json( await query )
  } )

route.route( '/coupons' )
  .get( async ( req, res ) => {

    const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )

    const from: string | null =
      req.query?.from?.toString() || null

    const to: string | null =
      req.query?.to?.toString() || null

    const query = connection( 'associates' )
      .select(
        'associates.name',
        'associates.id',
        connection.raw( 'IFNULL( COUNT( coupons.id ), 0 ) as generated_coupons' )
      )
      .leftJoin( 'coupons', 'coupons.associate', 'associates.id' )

    if ( from ) query.where( connection.raw( 'DATE( coupons.created_at )' ), '>=', from )

    if ( to ) query.where( connection.raw( 'DATE( coupons.created_at )' ), '<=', to )

    query
      .groupBy( 'associates.id' )
      .limit( limit )
      .offset( page * limit )

    return res.json( await query )
  } )

export default route
