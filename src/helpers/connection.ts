import fs from 'fs'
import knexCreate from 'knex'
import os from 'os'

const connection = knexCreate( {
  client: 'mysql',
  connection: {
    database: 'api_nd_homolog',
    user: 'api_nd',
    password: 'homolog@2k20',
    host: 'korbantechsites.csiwmkjtlagy.us-east-1.rds.amazonaws.com'
  }
} )

const stream = fs.createWriteStream( 'knex.log' )

connection.on( 'query', data => {
  stream.write( `[${ new Date().toISOString() }]: ${JSON.stringify( data )}` )
  stream.write( os.EOL )
} )

export default connection
