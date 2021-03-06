import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'

const PageContent = ( props: PageContent.Props ) =>
  <Container>
    {props.children}
  </Container>

const Container = styled.div`
  width: 100%;
  margin: auto;
  height: 100%;
  padding: 0 5%;
`

namespace PageContent {
  export interface Props extends PropsWithChildren<{}> {}
}

export = PageContent
