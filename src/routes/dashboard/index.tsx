import Express from 'express'
import fs from 'fs'

const dashboard = Express.Router()

dashboard.use( '/public', Express.static( 'dist' ) )
dashboard.use( '/public', Express.static( 'public' ) )

const html = fs.readFileSync( 'views/index.html' )

dashboard.get( '*', ( req, res ) => {
  res.set( 'Content-Type', 'text/html' )
  res.send( html )
} )

export default dashboard
