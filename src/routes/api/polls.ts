import Express from 'express'

import connection from '../../helpers/connection'

const polls = Express.Router()

polls.get( '/polls/:id/comments', async ( req, res ) => {
  if ( !req.params.id ) return res.status( 422 ).json()

  const limit = parseInt( req.query?.per?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' )
  const order = req.query?.order?.toString() || 'created_at'

  const excluded: 'on' | 'only' | 'true' | null =
    req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

  const user = req.query?.user?.toString()

  const query = connection( 'polls_comments' )
    .select( 'polls_comments.*', 'users.name' )
    .where( 'polls_comments.poll', req.params.id )
    .innerJoin( 'users', 'users.id', 'polls_comments.user' )
    .limit( limit )
    .offset( page * limit )
    .orderBy( order )

  if ( !excluded ) query.whereNull( 'deleted_at' )
  else if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

  if ( user ) query.where( 'user', user )

  return res.json( await query )
} )

polls.post( '/polls/:id/comments', async ( req, res ) => {
  if ( !req.params.id ) return res.status( 422 ).json()
  const user = req.body?.user?.toString()
  const comment = req.body?.comment?.toString() || req.query?.text?.toString()
  const poll = req.params.id
  if ( !user ) return res.status( 422 ).json( { message: 'no user' } )
  if ( !comment ) return res.status( 422 ).json( { message: 'no comment' } )

  await connection( 'polls_comments' )
    .insert( { user, comment, poll } )
  return res.json()
} )

polls.get( '/polls/:id', async ( req, res ) => {
  if ( !req.params.id ) return res.status( 422 ).json()

  const user = req.query?.user?.toString()

  const query = connection( 'polls_responses' )
    .select()
    .column( connection.raw( '`polls_responses`.`response` AS `key`' ) )
    .column( connection.raw( 'COUNT( `polls_responses`.`response` ) AS `qty`' ) )
    .where( 'poll', req.params.id )
    .groupBy( 'response' )

  if ( user ) query.where( 'user', user )

  return res.json( await query )
} )

polls.post( '/polls/:id', async ( req, res ) => {
  if ( !req.params.id ) return res.status( 422 ).json()
  const user = req.body?.user
  if ( !user ) return res.status( 422 ).json()
  const response = req.body?.response
  if ( !response ) return res.status( 422 ).json()

  await connection( 'polls_responses' )
    .insert( {
      user,
      poll: req.params.id,
      response
    } )

  const query = connection( 'polls_responses' )
    .select()
    .column( connection.raw( '`polls_responses`.`response` AS `key`' ) )
    .column( connection.raw( 'COUNT( `polls_responses`.`response` ) AS `qty`' ) )
    .where( 'poll', req.params.id )
    .groupBy( 'response' )

  return res.json( await query )
} )

polls.get( '/polls', async ( req, res ) => {
  const limit = parseInt( req.query?.per?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' )
  const order = req.query?.order?.toString() || 'created_at'

  const excluded: 'on' | 'only' | 'true' | null =
    req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

  let program: string | null = req.query?.program?.toString() || null

  const user = req.query?.user?.toString()

  const query = connection( 'polls' )
    .select( 'polls.*' )
    .limit( limit )
    .offset( page * limit )
    .orderBy( order, 'desc' )
    .groupBy( 'polls.id' )

  if ( !excluded ) query.whereNull( 'deleted_at' )
  else if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

  if ( program ) query.where( 'program', parseInt( program, 10 ) )

  if ( user ) query
    .leftJoin( 'polls_responses', clause => {
      clause.on( 'polls_responses.poll', 'polls.id' )
      clause.andOn( 'polls_responses.user', parseInt( user, 10 ) as any )
    } )
    .column( connection.raw( 'polls_responses.response AS response' ) )

  console.log( query.toString() )
  return res.json( await query )

} )

polls.post( '/polls', async ( req, res ) => {
  if ( !req.body.text ) return res.status( 422 ).json( { message: 'no text' } )
  if ( !req.body.program ) return res.status( 422 ).json( { nessage: 'no program' } )
  
  const ids = await connection( 'polls' )
    .insert( {
      text: req.body.text,
      program: req.body.program
    } )

  const poll = await connection( 'polls' )
    .select()
    .where( 'id', ids[0] )
    .first()
  
  return res.json( poll )
} )

export default polls
