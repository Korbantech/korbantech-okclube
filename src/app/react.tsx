import React from 'react'
import { FaHome, FaPoll, FaBell, FaUsers } from 'react-icons/fa'
import { Provider } from 'react-redux'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import AuthorizationRoute from '@components/AuthorizationRoute'
import LateralMenu from '@components/LateralMenu'
import PageContent from '@components/PageContent'
import AssociatedCreate from '@pages/AssociatedCreate'
import AssociatedEdit from '@pages/AssociatedEdit'
import AssociatesList from '@pages/AssociatesList'
import ComingSoon from '@pages/ComingSoon'
import NotificationCreate from '@pages/NotificationCreate'
import NotificationsList from '@pages/NotificationsList'
import PollCreate from '@pages/PollCreate'
import PollDetails from '@pages/PollDetails'
import PollEdit from '@pages/PollEdit'
import PollsList from '@pages/PollsList'
import SignIn from '@pages/SignIn'
import logo from '@public/assets/grupo-nd.png'
import store from '@store/index'
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Open Sans', sans-serif;
  }
  body {
    margin: 0;
  }
  body, #app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
`

const AppReact = () => 
  <Provider store={store}>
    <GlobalStyle />
    <BrowserRouter>
      <Switch>
        <Route exact path='/sign-in' component={SignIn}/>
        <AuthorizationRoute path='*' component={Dashboard}/>
      </Switch>
    </BrowserRouter>
  </Provider>

const Dashboard = () => 
  <Grid>
    <LateralMenu>
      <img src={logo} style={ { width: '60%', margin: '15% auto', display: 'flex' } }/>
      <LateralMenu.Item icon={FaHome} text='Principal' to='/' />
      <LateralMenu.Item icon={FaPoll} text='Enquetes' to='/polls'>
        <LateralMenu.Item text='Lista' to='/polls' />
        <LateralMenu.Item text='Criar' to='/polls/create' />
      </LateralMenu.Item>
      <LateralMenu.Item icon={FaBell} text='Notificações' to='/notifications'>
        <LateralMenu.Item text='Hístorico' to='/notifications' />
        <LateralMenu.Item text='Criar' to='/notifications/create' />
      </LateralMenu.Item>
      <LateralMenu.Item icon={FaUsers} text='Parceiros' to='/associates'>
        <LateralMenu.Item text='Lista' to='/associates' />
        <LateralMenu.Item text='Criar' to='/associates/create' />
      </LateralMenu.Item>
    </LateralMenu>
    <PageContent>
      <Switch>
        <Route exact path='/' component={ComingSoon} />
        <Route exact path='/polls' component={PollsList} />
        <Route exact path='/polls/create' component={PollCreate} />
        <Route exact path='/polls/:poll' component={PollEdit} />
        <Route exact path='/polls/:poll/details' component={PollDetails} />
        <Route exact path='/notifications' component={NotificationsList} />
        <Route exact path='/notifications/create' component={NotificationCreate} />
        <Route exact path='/associates' component={AssociatesList} />
        <Route exact path='/associates/create' component={AssociatedCreate} />
        <Route exact path='/associates/:associated' component={AssociatedEdit} />
      </Switch>
    </PageContent>
  </Grid>


const Grid = styled.div`
  display: grid;
  grid-template-areas: "lateral-menu page-content";
  grid-template-columns: min-content auto;
  height: 100%;
  width: 100%;
`

export = AppReact
