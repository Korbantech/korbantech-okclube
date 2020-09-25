import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'

const PageContent = ( props: PageContent.Props ) =>
  <Container>
    {props.children}
  </Container>

const Container = styled.div`
  width: 90%;
  margin: auto;
  height: 100%;
  padding: 0 5%;
  background-color: #cccccc30;
`

namespace PageContent {
  export interface Props extends PropsWithChildren<{}> {}
}

export = PageContent
