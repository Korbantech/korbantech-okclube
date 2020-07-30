import Express from 'express'
import path from 'path'
import pug from 'pug'
import pugStylus from 'pug-stylus'

import connection from '../../helpers/connection'
import transport from '../../helpers/transport'

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
    to: user.mail,
    subject: 'Recuperação de senha',
    html: template( { code, user } ),
  } )

  return res.json()
  
} )

export default mail
