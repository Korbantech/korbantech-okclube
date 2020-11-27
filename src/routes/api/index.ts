import axios, { AxiosError } from 'axios'
import Express from 'express'
import fs from 'fs'

import connection from '../../helpers/connection'
import admins from './admins'
import associates from './associates'
import internals from './internals'
import mail from './mail'
import news from './news'
import newspapers from './newspapers'
import notifications from './notifications'
import polls from './polls'
import programs from './programs'
import recover from './recover'
import regions from './regions'
import relatories from './relatories'
import users from './users'
import videos from './videos'

const ndErrorStream = fs.createWriteStream( 'nd-error.log', {
  flags: 'a'
} )

const api = Express.Router()

api.use( internals )
api.use( relatories )
api.use( news )
api.use( videos )
api.use( newspapers )
api.use( users )
api.use( programs )
api.use( polls )
api.use( mail )
api.use( recover )
api.use( associates )
api.use( notifications )
api.use( admins )
api.use( regions )

api.use( '/public', Express.static( 'public' ) )

api.get( '/check/:id', async ( req, res ) => {

  const id = parseInt( req.params?.id?.toString() || '0', 10 )

  if ( !id ) return res.status( 422 ).json()

  const user = await connection( 'users' )
    .select( '*' )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .where( 'users.id', id )
    .first()

  if ( !user?.document ) return res.status( 422 ).json( { message: 'no document' } )

  const document = user.document.replace( /(\.|-)/i, '' )

  const url = 'https://sac.ndonline.com.br/clubedoassinante/rest/clube/dados/identmf/' + document
  let data
  const start = Date.now()

  try {
    data = ( await axios.get( url ) ).data
  } catch ( e ) {
    const err: AxiosError = e
    data = err.response?.data
  } finally {
    ndErrorStream.write(
      `[${new Date().toISOString()}]time sac[${ Date.now() - start }ms][check register][${document}][${url}]\n`
    )
  }

  if ( !Array.isArray( data ) ) return res.status( 500 ).json()

  data = data.shift()

  if ( data.codigoDaPessoaAssinante === 0 ) return res.status( 404 ).json()

  await connection( 'users_nd_info' ).delete().where( 'user', id )

  await connection( 'users_nd_info' ).insert( {
    user,
    code: data.codigoDaPessoaAssinante,
    document: data.identMF,
    valid: data.dataDeValidade
  } )

  const info = await connection( 'users' )
    .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
    .where( 'users.id', id )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
    .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
    .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
    .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
    .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
    .first()

  return res.json( info )

} )

api.get( '/register/:cpf', async ( req, res ) => {
  const document = req.params?.cpf?.toString().replace( /\.|-/, '' ) || ''

  const user = await connection( 'users' )
    .select( '*' )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .where( 'users_nd_info.document', document )
    .first()

  if ( !user ) {
    const url = 'https://sac.ndonline.com.br/clubedoassinante/rest/clube/dados/identmf/' + document
    const start = Date.now()
    let data
    try {
      data = ( await axios.get( url ) ).data
    } catch ( e ) {
      const err: AxiosError = e
      data = err.response?.data
    } finally {
      ndErrorStream.write( `time sac[${ Date.now() - start }ms][${document}][${url}]\n` )
    }

    if ( !Array.isArray( data ) ) return res.status( 500 ).json()

    data = data.shift()

    if ( data.codigoDaPessoaAssinante === 0 )
      return res.json( { document } )

    const dataUser = {
      name: data.nomeDoBeneficario || data.nomeDoAssinante,
      mail: data.email,
      code: data.codigoDaPessoaAssinante,
      document: data.identMF,
      valid: data.dataDeValidade,
    }

    return res.json( dataUser )
  }

  res.status( 200 ).json( { ...user, alreadyExists: true } )
} )

api.get( '/login', async ( req, res ) => {

  const mail = req.query?.mail?.toString() || ''
  const pass = req.query?.pass?.toString() || ''

  let user = await connection( 'users' )
    .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
    .where( 'users.mail', mail )
    .where( 'users.pass', pass )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
    .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
    .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
    .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
    .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
    .first()

  if ( !user ) return res.status( 404 ).json()

  res.json( user )
} )

api.route( '/associated/:id' )
  .get( async ( req, res ) => {
    const associated = await connection( 'associates' )
      .select( '*' )
      .where( 'associates.id', req.params.id )
      .first()

    if ( !associated ) return res.status( 404 ).json( {} )

    res.json( associated )
  } )
  .delete( async ( req, res ) => {

    const affected = await connection( 'associates' )
      .update( {
        deleted_at: connection.fn.now( 6 )
      } )

    if ( !affected ) return res.json( {} )

    res.json( {} )
  } )

api.route( '/associates/categories' )
  .get( async ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

    const user: string | null = req.query?.user?.toString() || null

    const query = connection( 'benefits_categories' )
      .select( '*' )
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

    return res.json( await query )
  } )

api.post( '/user/category/favorite', async ( req, res ) => {
  const user = req.body.user
  const category = req.body.category

  await connection( 'favorite_categories' )
    .insert( { user, category } )

  res.json( {} )
} )

api.delete( '/user/category/favorite', async ( req, res ) => {
  const user = req.body.user
  const category = req.body.category

  await connection( 'favorite_categories' )
    .delete()
    .where( 'user', user )
    .where( 'category', category )

  res.json( {} )
} )

api.post( '/user/associated/favorite', async ( req, res ) => {
  const user = req.body.user
  const associated = req.body.associated

  await connection( 'favorite_associates' )
    .insert( { user, associated } )

  res.json( {} )
} )

api.delete( '/user/associated/favorite', async ( req, res ) => {
  const user = req.body.user
  const associated = req.body.associated

  await connection( 'favorite_associates' )
    .delete()
    .where( 'user', user )
    .where( 'associated', associated )

  res.json( {} )
} )


api.route( '/associates' )
  .get( async ( req, res ) => {
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
        connection.raw( 'GROUP_CONCAT( DISTINCT associates_addresses.address SEPARATOR \'|\' ) AS address' ),
        connection.raw( 'GROUP_CONCAT( DISTINCT associates_phones.phone SEPARATOR \'|\' ) AS phones' ),
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
  } )

api.all( '*', ( req, res ) => {
  res.status( 404 ).json( {} )
} )

export default api
