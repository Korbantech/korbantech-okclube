import bodyparser from 'body-parser'
import Express from 'express'
import vhost from 'vhost'

import api from './routes/api'
import dashboard from './routes/dashboard'

const app = Express()

app.set( 'view engine', 'pug' )

app.use( bodyparser.urlencoded( { extended: true } ) )
app.use( bodyparser.json( { limit: '100mb' } ) )

// app.use( '/public', Express.static( 'dist' ) )

app.use( vhost( /^dashboard\..*/, dashboard ) )

app.use( vhost( /^api\..*/, api ) )

app.listen( 80, () => { console.log( 'server start' ) } )
