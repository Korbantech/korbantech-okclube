import Times from '@cookiex/times'
import Express from 'express'

import cacheHandler from '../../handlers/cache'
import connection from '../../helpers/connection'

const newspapers = Express.Router()

const route = newspapers.route( '/newspapers' )

route.get(
  cacheHandler( 30 * 60 * 60 * 1000, ( data, res ) => res.json( JSON.parse( data ) ) ),
  async ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
    req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null
    const from: Times.Date | null = req.query?.from && new Times.Date( req.query?.from.toString() ) || null
    const to: Times.Date | null = req.query?.to && new Times.Date( req.query?.to.toString() ) || null

    const query = connection( 'newspaper_editions' )
      .select( '*' )
      .limit( limit )
      .offset( page * limit )
      .orderBy( order, orderType )

    if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

    if ( like ) query.where( 'name', 'like', `%${like}%` )

    if ( from )
      if ( to ) query.whereBetween( 'screening_date', [ from, to ] )
      else query.where( 'screening_date', '>', from )

    else if ( to ) query.where( 'screening_date', '<', from )

    res.json( await query )
  } )

export default newspapers
