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
    .orderBy( order, 'desc' )

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

polls.route( '/polls/:id' )
  .get( async ( req, res ) => {
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
  .post( async ( req, res ) => {
    if ( !req.params.id ) return res.status( 422 ).json()
    const user = req.body?.user
    if ( !user ) return res.status( 422 ).json()
    const response = req.body?.response
    if ( !response ) return res.status( 422 ).json()
  
    await connection( 'polls_responses' )
      .insert( { user, poll: req.params.id, response } )
  
    const query = connection( 'polls_responses' )
      .select()
      .column( connection.raw( '`polls_responses`.`response` AS `key`' ) )
      .column( connection.raw( 'COUNT( `polls_responses`.`response` ) AS `qty`' ) )
      .where( 'poll', req.params.id )
      .groupBy( 'response' )
  
    return res.json( await query )
  } )
  .put( async ( req, res ) => {
    if ( !req.params.id ) return res.status( 422 ).json()
    if ( !req.body.text ) return res.status( 422 ).json( { message: 'no text' } )
    
    await connection( 'polls' )
      .where( 'id', req.params.id )
      .update( {
        text: req.body.text,
        program: req.body.program,
        location: req.body.location
      } )

    const poll = await connection( 'polls' )
      .select()
      .where( 'id', req.params.id )
      .first()
    
    return res.json( poll )
  } )
  .patch( async ( req, res ) => {
    if ( !req.params.id ) return res.status( 422 ).json()
    const data: any = {}
    if ( req.body.text ) data.text = req.body.text
    if ( req.body.program ) data.program = req.body.program
    if ( req.body.location ) data.program = req.body.location

    await connection( 'polls' )
      .where( 'id', req.params.id )
      .update( data )

    const poll = await connection( 'polls' )
      .select()
      .where( 'id', req.params.id )
      .first()
    
    return res.json( poll )
  } )
  .delete( async ( req, res ) => {
    if ( !req.params.id ) return res.status( 422 ).json()

    await connection( 'polls' )
      .where( 'id', req.params.id )
      .update( { deleted_at: new Date() } )
  } )

polls.get( '/polls', async ( req, res ) => {
  const limit = parseInt( req.query?.per?.toString() || req.query?.limit?.toString() || '30' )
  const page = parseInt( req.query?.page?.toString() || '0' )
  const order = req.query?.order?.toString() || 'created_at'

  const excluded: 'on' | 'only' | 'true' | null =
    req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

  const program: string | null = req.query?.program?.toString() || null

  const location: string | null = req.query?.location?.toString() || null

  const restrict =
    ( req.query?.restrict?.toString() as 'false' | 'true' || 'false' ) === 'true'

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
  if ( location && restrict ) query.where( 'location', location )
  else if ( location ) query.where( clause => {
    clause.where( 'location', location ).orWhereNull( 'location' )
  } )

  if ( user ) query
    .leftJoin( 'polls_responses', clause => {
      clause.on( 'polls_responses.poll', 'polls.id' )
      clause.andOn( 'polls_responses.user', parseInt( user, 10 ) as any )
    } )
    .column( connection.raw( 'polls_responses.response AS response' ) )

  return res.json( await query )

} )

polls.post( '/polls', async ( req, res ) => {
  if ( !req.body.text ) return res.status( 422 ).json( { message: 'no text' } )
  
  const ids = await connection( 'polls' )
    .insert( {
      text: req.body.text,
      program: req.body.program,
      location: req.body.location
    } )

  const poll = await connection( 'polls' )
    .select()
    .where( 'id', ids[0] )
    .first()
  
  return res.json( poll )
} )

export default polls
