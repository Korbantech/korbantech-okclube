import connection from '@helpers/connection'
import bcrypt from 'bcrypt'
import { Command } from 'commander'
import { createInterface } from 'readline'

const create = new Command( 'create' )

create.storeOptionsAsProperties( false )

create.requiredOption( '-n, --name <name>', 'set name of admin user' )
create.requiredOption( '-e, --email <email>', 'set email of admin user' )
create.requiredOption( '-p, --password', 'set pass of admin user' )

create.action( async () => {
  const opts = create.opts()

  const readlineInterface = createInterface( process.stdin, process.stdout )

  const existUser = !!await connection( 'admin_users' ).where( 'admin_users.email', opts.email ).first()

  if ( existUser ) return console.log( 'email already exists, please choose another' )

  const password = await new Promise<string>( resolve => readlineInterface.question( 'Write password: ', resolve ) )

  const confirmPassword = await new Promise<string>(
    resolve => readlineInterface.question( 'Confirm password: ', resolve )
  )

  if ( password !== confirmPassword ) return console.log( 'passwords not match, please try again' )

  opts.password = await bcrypt.hash( password, 12 )

  await connection( 'admin_users' ).insert( opts )

  console.log( 'admin user created' )

  connection.destroy()
} )

export { create }
