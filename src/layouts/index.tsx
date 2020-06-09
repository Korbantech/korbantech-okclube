import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { ThemeProvider, createGlobalStyle } from 'styled-components'

import Home from '../pages/home'
import Container from './container'
import Log from './log'
import Menu from './menu'
import Screen from './screen'

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
  }

  #app-root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
`

const Layout = () =>
  <ThemeProvider theme={ {} }>
    <GlobalStyle />
    <Container>
      <Menu items={ [ {
        title: 'Home',
        to: '/'
      }, {
        title: 'Newspapers',
        to: '/newspapers'
      } ] }/>
      <Screen>
        <Switch>
          <Route path='/' exact component={ Home } />
          <Route path='/newspapers' exact component={ null } />
          <Route path='/newspaper/:newspaper' exact component={ null } />
          <Route path='/newspaper/:newspaper/editions' exact component={ null } />
          <Route path='/newspapers/editions' exact component={ null } />
          <Route path='/newspaper/:newspaper/edition/:edition' exact component={ null } />
          <Route path='/newspapers/edition/:edition' exact component={ null } />
          <Route path='/404' exact component={ null } />
          <Route path='*' component={ null } />
        </Switch>
      </Screen>
      <Log />
    </Container>
  </ThemeProvider>

export default Layout
