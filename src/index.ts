import bodyparser from 'body-parser'
import cors from 'cors'
import Express from 'express'
import ExpressWs from 'express-ws'
import fs from 'fs'
import morgan from 'morgan'
import vhost from 'vhost'
import yargs from 'yargs'

import { IS_PRODUCTION_ENVIRONMENT } from './constants'
import connection from './helpers/connection'
import api from './routes/api'
import dashboard from './routes/dashboard'

const args: {
  port: string,
  log: string
} = yargs.argv as any

const app = ( () => {
  const express = Express()

  const instace = ExpressWs( express )
  const webscoket = instace.getWss()

  instace.app.set( 'webscoket', webscoket )
  instace.app.set( 'ws', webscoket )

  return instace.app
} )()

const stream = fs.createWriteStream( 'server.log' )

/* Application variables */

app.set( 'log type', args.log ?? IS_PRODUCTION_ENVIRONMENT ? 'combined' : 'dev' )
app.set( 'view engine', 'pug' )
app.set( 'environment', IS_PRODUCTION_ENVIRONMENT ? 'production' : 'development' )
app.set( 'port', args.port ?? 80 )

app.use( morgan( app.get( 'log type' ), IS_PRODUCTION_ENVIRONMENT ? { stream } : undefined ) )
app.use( ( req, res, next ) => {
  res.render( 'index.pug' )
  if ( req.protocol === 'http' && IS_PRODUCTION_ENVIRONMENT )
    res.redirect( `https://${req.hostname}${req.originalUrl}`, 308 )
  else next()
} )
app.use( cors() )
app.use( bodyparser.urlencoded( { extended: true } ) )
app.use( bodyparser.json( { limit: '100mb' } ) )

app.use( '/api', api )
app.use( vhost( /^api\..*/, api ) )

app.use( vhost( /^dashboard\..*/, dashboard ) )

app.use( '/public', Express.static( 'public' ) )

app.listen( app.get( 'port' ), () => {
  connection.raw( 'SET SESSION sql_mode=( SELECT REPLACE( @@sql_mode, \'ONLY_FULL_GROUP_BY\', \'\' ) );' )
    .then( () => {
      console.log( `running server in port ${app.get( 'port' )} usign envoriment mode ${app.get( 'environment' )}` )
    } )
    .catch( ( reason ) => {
      console.warn( 'Warning: failed to configure database' )
      console.warn( 'Warning:', reason.message )
      console.log( `running server in port ${app.get( 'port' )} usign envoriment mode ${app.get( 'environment' )}` )
    } )
} )

export default app
