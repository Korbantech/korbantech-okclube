import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'

import Log from '../log'
import Menu from '../menu'
import Screen from '../screen'

const Container = ( { children }: Container.Props ) =>
  <Container.Styled>
    {children}
  </Container.Styled>

Container.Styled = styled.div`
  display: grid;
  grid-template-areas: "dashboard-menu dashboard-screen dashboard-log";
  grid-template-columns: min-content auto min-content;
  height: 100vh;
  > ${Menu.Styled} { grid-area: dashboard-menu; }
  > ${Screen.Styled} { grid-area: dashboard-screen; }
  > ${Log.Styled} { grid-area: dashboard-log; }
`

namespace Container {
  export interface Props extends PropsWithChildren<{}> {}
}

export default Container
