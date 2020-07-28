import bodyparser from 'body-parser'
import Express from 'express'
import ExpressWs from 'express-ws'
import vhost from 'vhost'

import api from './routes/api'
import dashboard from './routes/dashboard'

const app = ( () => {
  const express = Express()

  const instace = ExpressWs( express )
  const webscoket = instace.getWss()

  instace.app.set( 'webscoket', webscoket )
  instace.app.set( 'ws', webscoket )

  return instace.app
} )()

app.set( 'view engine', 'pug' )

app.use( bodyparser.urlencoded( { extended: true } ) )
app.use( bodyparser.json( { limit: '100mb' } ) )

app.use( vhost( /^dashboard\..*/, dashboard ) )

app.use( vhost( /^api\..*/, api ) )

app.listen( 9000, () => { console.log( 'server start' ) } )

export default app
