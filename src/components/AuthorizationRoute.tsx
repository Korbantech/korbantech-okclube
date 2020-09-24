import React, { ComponentType } from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'

import useHasUser from '@hooks/useHasUser'

const AuthorizationRoute = ( { component: Component }: AuthorizationRoute.Props ) => {
  const allow = useHasUser()

  return <Route render={ () => {
    if ( !allow ) return <Redirect to='/sign-in'/>
    return <Component />
  } } />
}

namespace AuthorizationRoute {
  export interface Props extends RouteProps {
    component: ComponentType<any>
  }
}

export = AuthorizationRoute
