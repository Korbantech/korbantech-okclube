/* eslint-disable array-element-newline */
/* eslint-disable array-bracket-newline */
import Express from 'express'

import connection from '../../helpers/connection'
import Dir from '../../models/Dir'
import File from '../../models/File'

const users = Express.Router()

const route = users.route( '/user' )

const userMetas = users.route( '/users/:id/metas' )

userMetas
  .put( async ( req, res ) => {
    const user = req.param( 'id' )
    const body = req.body ?? {}
    await connection( 'users_metas' )
      .where( 'user', user )
      .whereIn( 'key', Object.keys( body ) )
      .delete()

    await connection( 'users_metas' )
      .insert( Object.entries( body ).map( ( [ key, value ] ) => ( { user, key, value } ) ) )

    const rows = await connection( 'users_metas' )
      .select()
      .where( 'user', user )

    const metas = rows.reduce( ( group, { key, value } ) => ( { ...group, [key]: value } ), {} )

    res.json( metas )
  } )
  .get( async ( req, res ) => {
    const user = req.param( 'id' )

    const rows = await connection( 'users_metas' )
      .select()
      .where( 'user', user )

    const metas = rows.reduce( ( group, { key, value } ) => ( { ...group, [key]: value } ), {} )

    res.json( metas )
  } )

route.post( async ( req, res ) => {
  const user = {
    mail: req.body.mail,
    name: req.body.name,
    pass: req.body.pass
  }

  const useId = ( await connection( 'users' )
    .insert( user ) ).pop()

  const ndInfo = {
    tel: req.body.tel,
    zipCode: req.body.zipCode || req.body.zip_code,
    document: req.body.document,
    address: req.body.address,
    contract: req.body.contract,
    valid: req.body.valid,
    user: useId
  }

  await connection( 'users_nd_info' )
    .insert( ndInfo )

  res.json( {} )
} )

route.put( async ( req, res ) => {

  let id = req.body.id || req.body.user || req.body.userId

  const user = {
    mail: req.body.mail,
    name: req.body.name,
    pass: req.body.pass
  }

  const ndInfo = {
    tel: req.body.tel,
    zip_code: req.body.zipCode || req.body.zip_code,
    document: req.body.document,
    address: req.body.address,
    contract: req.body.contract,
    valid: req.body.valid
  }

  const metaInfo = {
    facebook_uri: req.body.facebook,
    twitter_uri: req.body.twitter,
    instagram_uri: req.body.instagram,
    birthday: new Date( req.body.birthday )
  }

  if ( !id )
    await connection( 'users' ).insert( user )
      .then( ( [ userId ] ) => {
        id = userId
        return Promise.all( [
          connection( 'users_nd_info' ).insert( { ...ndInfo, user: id } ),
          connection( 'users_meta_info' ).insert( { ...metaInfo, user: id } )
        ] )
      } )

  else
    await Promise.all( [
      connection( 'users' )
        .update( user )
        .where( 'id', '=', id ),
      connection( 'users_nd_info' )
        .update( ndInfo )
        .where( 'user', '=', id ),
      connection( 'users_meta_info' )
        .update( metaInfo )
        .where( 'user', '=', id )
    ] )

  let photo: string | null = req.body.photo?.replace( /^data:image\/[a-z]{3,4};base64,/, '' ) || null

  await connection( 'users_photos' )
    .delete()
    .where( 'user', '=', id )

  if ( photo ) {

    if ( /^https?:\/\//.test( photo ) ) {
      await connection( 'users_photos' )
        .insert( {
          user: id,
          photo
        } )
    }

    else {
      if ( !await File.exists( 'public/users/images' ) )
        await Dir.make( 'public/users/images', { recursive: true } )

      console.log(
        await File.exists( 'public/users/images' ),
        await Dir.make( 'public/users/images', { recursive: true } )
      )

      try {

        await File.write( `public/users/images/${id}-photo.jpg`, photo, 'base64' )

        const base = 'http://dashboard.app.ndmais.com.br/public/users/images'
        photo = `${base}/${id}-photo.jpg?at=${new Date().getTime()}`

        await connection( 'users_photos' )
          .insert( {
            user: id,
            photo
          } )

      } catch { photo = null }
    }
  }

  const data = await connection( 'users' )
    .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
    .where( 'users.id', id )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
    .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
    .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
    .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
    .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
    .first()

  res.json( data )
} )

route.delete( async ( req, res ) => {
  const id = req.body.id || req.body.user || req.body.userId

  if ( !id ) return res.status( 422 ).json()

  await connection( 'users_nd_info' ).delete().where( 'user', id )
  await connection( 'favorite_associates' ).delete().where( 'user', id )
  await connection( 'favorite_programs' ).delete().where( 'user', id )
  await connection( 'favorite_categories' ).delete().where( 'user', id )
  await connection( 'polls_responses' ).delete().where( 'user', id )
  await connection( 'users_meta_info' ).delete().where( 'user', id )
  await connection( 'users_photos' ).delete().where( 'user', id )
  await connection( 'users' ).delete().where( 'id', id )

  res.json()
} )

export default users
