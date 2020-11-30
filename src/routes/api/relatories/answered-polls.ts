import connection from '@helpers/connection'
import Express from 'express'


const route = Express.Router()


route.route( '/answered-polls/count' )
  .get( async ( req, res ) => {

    // const period: 'month' | 'week'  | null =
    //   req.query?.period?.toString() as 'month' | 'week' | null

    const sunday = new Date()
    sunday.setDate( sunday.getDate() - sunday.getDay() )

    const query = connection( 'polls' )
      .select(
        connection.raw( 'COUNT( polls_month.id ) AS month' ),
        connection.raw( 'COUNT( polls_week.id ) AS week' ),
      )
      .leftJoin(
        connection( 'polls' )
          .select( '*' )
          .where(
            connection.raw( 'MONTH(polls.created_at) = MONTH( NOW() )' ),
          ).where(
            connection.raw( 'YEAR( polls.created_at ) = YEAR( NOW() )' ),
          )
          .join(
            connection( 'polls_responses' )
              .select( '*' )
              .as( 'polls_responses_month' ),
            'polls_responses_month.poll', 'polls.id'
          )
          .groupBy( 'polls.id' )
          .as( 'polls_month' ),
        'polls_month.id', 'polls.id'
      )
      .leftJoin(
        connection( 'polls' )
          .select( '*' )
          .where(
            'polls.created_at', '>=', sunday
          )
          .join(
            connection( 'polls_responses' )
              .select( '*' )
              .as( 'polls_responses_week' ),
            'polls_responses_week.poll', 'polls.id'
          )
          .groupBy( 'polls.id' )
          .as( 'polls_week' ),
        'polls_week.id', 'polls.id'
      )
      .where(
        connection.raw( 'MONTH(polls.created_at) = MONTH( NOW() )' ),
      ).where(
        connection.raw( 'YEAR( polls.created_at ) = YEAR( NOW() )' ),
      )
      .having( 'week', '>=', 0 )
      .having( 'month', '>=', 0 )
      .first()
    return res.json( await query )
  } )

route.route( '/answered-polls' )
  .get( async ( req, res ) => {

    const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )

    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

    const program: string | null = req.query?.program?.toString() || null

    const location: string | null = req.query?.location?.toString() || null

    const from: string | null =
      req.query?.from?.toString() || null

    const to: string | null =
      req.query?.to?.toString() || null

    const restrict =
      ( req.query?.restrict?.toString() as 'false' | 'true' || 'false' ) === 'true'

    const query = connection( 'polls' )
      .select(
        'polls.*',
        connection.raw( 'COUNT( polls_responses.poll ) AS responses' )
      ).leftJoin( 'polls_responses', 'polls_responses.poll', 'polls.id' )

    if ( !excluded ) query.whereNull( 'deleted_at' )
    else if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

    if ( program && restrict ) query.where( 'program', parseInt( program, 10 ) )
    else if ( program ) query.where( clause => {
      clause.where( 'program', program ).orWhereNull( 'program' )
    } )
    if ( location && restrict ) query.where( 'location', location )
    else if ( location ) query.where( clause => {
      clause.where( 'location', location ).orWhereNull( 'location' )
    } )

    if ( from ) query.where( connection.raw( 'DATE( polls.created_at )' ), '>=', from )

    if ( to ) query.where( connection.raw( 'DATE( polls.created_at )' ), '<=', to )


    query
      .groupBy( 'polls.id' )
      .limit( limit )
      .offset( page * limit )

    return res.json( await query )
  } )

export default route
