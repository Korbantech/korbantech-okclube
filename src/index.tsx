import bodyparser from 'body-parser'
import Express from 'express'
import ExpressWs from 'express-ws'
import vhost from 'vhost'

import api from './routes/api'
import dashboard from './routes/dashboard'

const app = ( () => {
  const express = Express()

  const app = ExpressWs( express, undefined, {} )

  return app.app
} )()

app.set( 'view engine', 'pug' )

app.use( bodyparser.urlencoded( { extended: true } ) )
app.use( bodyparser.json( { limit: '100mb' } ) )

app.use( vhost( /^dashboard\..*/, dashboard ) )

app.use( vhost( /^api\..*/, api ) )

app.listen( 9000, () => { console.log( 'server start' ) } )
