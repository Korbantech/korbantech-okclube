import React from 'react'
import ReactDOM from 'react-dom/server'
import { Helmet } from 'react-helmet'

import Express from 'express'
import { ServerStyleSheet } from 'styled-components'

import App from '../../app'
import Store from '../../store'

const dashboard = Express.Router()

dashboard.use( '/public', Express.static( 'dist' ) )
dashboard.use( '/public', Express.static( 'public' ) )

dashboard.get( '*', ( req, res ) => {

  const sheet = new ServerStyleSheet()

  try {

    const application = <App server location={req.url} context={{}} sheet={sheet}/>

    const react = ReactDOM.renderToString( application )

    const styles = sheet.getStyleTags()

    const helmet = Helmet.renderStatic()

    const state = Store.getState()

    res.render( 'index', { react, state, helmet, styles } )

  } catch ( e ) {

    console.log( `Error in rendering request: ${e.message}` )

    res.status( 500 ).end()

  } finally {

    sheet.seal()

  }

} )

export default dashboard
