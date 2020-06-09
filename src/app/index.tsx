import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { StaticRouter, BrowserRouter } from 'react-router-dom'

import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

import Layout from '../layouts'
import Store from '../store'

const App = ( props: App.Props ) => {

  useEffect( () => {
    Array.from(
      document.getElementsByClassName( 'remove-on-load' )
    ).forEach( toRemove => toRemove.parentElement.removeChild( toRemove ) )
  } )

  if ( props.server )
    return (
      <StyleSheetManager sheet={props.sheet.instance}>
        <StaticRouter location={props.location} context={ props.context }>
          <Provider store={ Store }>
            <Layout />
          </Provider>
        </StaticRouter>
      </StyleSheetManager>
    )

  return (
    <BrowserRouter>
      <Provider store={ Store }>
        <Layout />
      </Provider>
    </BrowserRouter>
  )

}

namespace App {
  export type Props =  {
    server: true,
    location: string
    context: any
    sheet: ServerStyleSheet
  } | { server?: undefined | false }
}

export default App
