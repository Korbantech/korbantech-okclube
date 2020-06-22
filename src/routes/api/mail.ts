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

const mail = Express.Router()

mail.post( '/recover', async ( req, res ) => {
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
    to: 'tony.js@zoho.eu',
    subject: 'Recuperação de senha',
    html: template( { code, user } ),
  } )

  return res.json()
  
} )

export default mail
