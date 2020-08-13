import fs from 'fs'
import knexCreate from 'knex'
import os from 'os'

const connection = knexCreate( {
  client: 'mysql',
  connection: {
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    host: process.env.MYSQL_HOST
  }
} )

const stream = fs.createWriteStream( 'knex.log' )

connection.on( 'query', data => {
  stream.write( `[${ new Date().toISOString() }]: ${JSON.stringify( data )}` )
  stream.write( os.EOL )
} )

export default connection
