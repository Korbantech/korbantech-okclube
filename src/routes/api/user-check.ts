import axios from 'axios'
import { Router } from 'express'
import fs from 'fs'

import connection from '../../helpers/connection'

const ndErrorStream = fs.createWriteStream( 'nd-error.log', {
  flags: 'a'
} )

const usercheck = Router()

usercheck.get( '/check/1', async ( req, res ) => {
  const id = 1

  const user = await connection( 'users' )
    .select( '*' )
    .where( 'users.id', id )
    .first()

  const prevInfo = await connection( 'users_nd_info' )
    .where( 'user', user.id )
    .first()
    .catch( console.error )

  if( prevInfo ) {
    await connection( 'users_nd_info' ).update( {
      code: 1,
      document: '73368415034',
      valid: new Date( 2030, 0, 1, 19, 0, 0 )
    } )
      .where( 'user', id )
      .catch( console.error )
  } else {
    await connection( 'users_nd_info' )
      .insert( {
        user: user.id,
        code: 1,
        document: '73368415034',
        valid: new Date( 2030, 0, 1, 19, 0, 0 ) }
      )
      .catch( console.error )
  }

  await connection( 'users' )
    .where( 'id', user.id )
    .update( { updated_at: new Date() } )

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

usercheck.get( '/check/:id', async ( req, res ) => {

  const id = parseInt( req.params?.id?.toString() || '0', 10 )

  if ( !id ) return res.status( 422 ).json()

  const user = await connection( 'users' )
    .select( '*' )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .where( 'users.id', id )
    .first()

  if ( !user?.document ) return res.status( 422 ).json( { message: 'no document' } )

  const update = async () =>
    await connection( 'users' ).update( { updated_at: new Date() } ).where( 'id', user.id )

  const document = user.document.replace( /\D/ig, '' )

  const url = 'https://sac.ndonline.com.br/clubedoassinante/rest/clube/dados/identmf/' + document
  let data
  const start = Date.now()

  try { data = ( await axios.get( url ) ).data }
  catch ( e ) { data = e.response?.data }
  finally {
    ndErrorStream.write(
      `[${new Date().toISOString()}]time sac[${ Date.now() - start }ms][check register][${document}][${url}]\n`
    )
  }

  if ( !Array.isArray( data ) ) return res.status( 500 ).json()

  data = data.shift()

  if ( data.codigoDaPessoaAssinante === 0 ) {
    await connection( 'users_nd_info' )
      .update( { code: null, valid: null } )
      .where( 'user', id )
      .catch( console.error )
    await update()
    return res.status( 200 ).json(
      await connection( 'users' )
        .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
        .where( 'users.id', id )
        .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
        .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
        .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
        .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
        .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
        .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
        .first()
    )
  }

  const prevInfo = await connection( 'users_nd_info' )
    .where( 'user', id )
    .first()
    .then( res => res )
    .catch( console.error )

  if( prevInfo ) {
    await connection( 'users_nd_info' ).update( {
      code: data.codigoDaPessoaAssinante,
      document: data.identMF,
      valid: data.dataDeValidade,
    } )
      .where( 'user', id )
      .then()
      .catch( console.error )
  } else {
    await connection( 'users_nd_info' )
      .insert( {
        user: user.id,
        code: data.codigoDaPessoaAssinante,
        document: data.identMF,
        valid: data.dataDeValidade,
      } )
      .then()
      .catch( console.error )
  }

  await update()

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

export default usercheck
