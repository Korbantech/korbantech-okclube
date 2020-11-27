import connection from '@helpers/connection'
import Express from 'express'


const route = Express.Router()


route.route( '/answered-polls' )
  .get( async ( req, res ) => {

    const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )

    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

    const program: string | null = req.query?.program?.toString() || null

    const location: string | null = req.query?.location?.toString() || null

    const restrict =
      ( req.query?.restrict?.toString() as 'false' | 'true' || 'false' ) === 'true'

    const query = connection( 'polls' )
      .select(
        'polls.*',
        connection.raw( 'COUNT( polls_responses.poll ) AS responses' )
      ).join( 'polls_responses', 'polls_responses.poll', 'polls.id' )

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

    query
      .groupBy( 'polls.id' )
      .limit( limit )
      .offset( page * limit )

    return res.json( await query )
  } )

export default route
