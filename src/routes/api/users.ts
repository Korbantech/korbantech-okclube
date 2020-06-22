import Express from 'express'

import connection from '../../helpers/connection'
import Dir from '../../models/Dir'
import File from '../../models/File'

const users = Express.Router()

const route = users.route( '/user' )

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

  const id = req.body.id || req.body.user || req.body.userId

  const user = {
    mail: req.body.mail,
    name: req.body.name,
    pass: req.body.pass
  }

  await connection( 'users' )
    .update( user )
    .where( 'id', '=', id )

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

  let photo: string | null = req.body.photo?.replace( /^data:image\/[a-z]{3,4};base64,/, '' ) || null

  await connection( 'users_nd_info' )
    .update( ndInfo )
    .where( 'user', '=', id )

  await connection( 'users_meta_info' )
    .update( metaInfo )
    .where( 'user', '=', id )

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

  const meta = {
    facebook: metaInfo.facebook_uri,
    twitter: metaInfo.twitter_uri,
    instagram: metaInfo.instagram_uri,
    birthday: metaInfo.birthday
  }

  res.json( { ...user, ...ndInfo, ...meta, photo, id } )
} )

export default users
