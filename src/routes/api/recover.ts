import Express from 'express'
import nodemailer from 'nodemailer'
import path from 'path'
import pug from 'pug'
import pugStylus from 'pug-stylus'

import connection from '../../helpers/connection'

const transport = nodemailer.createTransport( {
  service: 'gmail',
  auth: {
    user: 'devkorbantech@gmail.com',
    pass: 'K0rb@nt3ch@1502'
  }
} )

const template = pug.compileFile( path.resolve( 'views', 'recover.pug' ), {
  filters: { stylus: pugStylus() }
} )

const recover = Express.Router()

recover.post( '/recover/send', async ( req, res ) => {
  if ( !req.body?.mail ) return res.status( 422 ).json()

  const user = await connection( 'users' )
    .select()
    .where( 'mail', req.body.mail )
    .limit( 1 )
    .first()

  if ( !user ) return res.status( 404 ).json()

  const code = Math.floor( 100000 + Math.random() * 900000 )

  await connection( 'pass_recover' )
    .insert( { user: user.id, code } )

  await transport.sendMail( {
    from: 'devkorbantech@gmail.com',
    to: user.mail,
    subject: 'Recuperação de senha',
    html: template( { code, user } ),
  } )
    .then( () => { console.log( `[${new Date().toISOString()}]mail to: ${user.mail}` ) } )

  return res.json()
  
} )

recover.get( '/recover/:code/check', async ( req, res ) => {
  const code = parseInt( req.params?.code?.toString() || '0', 10 )
  if ( !code ) return res.json( 422 )

  const passRecover = await connection( 'pass_recover' )
    .select()
    .where( 'created_at', '>', new Date( Date.now() - 1000 * 60 * 60 * 24 ) )
    .whereNull( 'used_at' )
    .whereNull( 'checked_at' )
    .where( 'code', code )
    .first()

  if ( !passRecover ) return res.json( 404 )

  await connection( 'pass_recover' )
    .update( { checked_at: new Date() } )
    .whereNull( 'used_at' )
    .whereNull( 'checked_at' )
    .where( 'code', code )
  
  return res.json()
} )

recover.post( '/recover/:code/pass', async ( req, res ) => {
  const code = parseInt( req.params?.code?.toString() || '0', 10 )
  const pass = req.body.pass

  if ( !code || !pass ) return res.json( 422 )

  const passRecover = await connection( 'pass_recover' )
    .select()
    .where( 'created_at', '>', new Date( Date.now() - 1000 * 60 * 60 * 24 ) )
    .whereNull( 'used_at' )
    .whereNotNull( 'checked_at' )
    .where( 'code', code )
    .first()
  
  if ( !passRecover ) return res.json( 404 )

  await connection( 'pass_recover' )
    .update( { used_at: new Date() } )
    .whereNull( 'used_at' )
    .whereNull( 'checked_at' )
    .where( 'code', code )
  
  await connection( 'users' )
    .update( { pass } )
    .where( 'id', passRecover.user )

  const info = await connection( 'users' )
    .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
    .where( 'users.id', passRecover.user )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
    .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
    .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
    .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
    .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
    .first()

  return res.json( info )
} )

export default recover
