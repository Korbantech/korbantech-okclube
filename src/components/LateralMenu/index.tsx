import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'

import LateralMenuItem from './Item'
import LateralMenuSeparator from './Separator'

const LateralMenu = ( props: LateralMenu.Props ) => {
  return (
    <Container>
      <List>
        {props.children}
      </List>
    </Container>
  )
}

const Container = styled.div`
  padding: 15px 30px 0;
  overflow-y: scroll;

`

const List = styled.ul`
  margin: 0;
  padding: 0;
`

namespace LateralMenu {
  export interface Props extends PropsWithChildren<{}> {}
}

LateralMenu.Item = LateralMenuItem
LateralMenu.Separator = LateralMenuSeparator

export = LateralMenu
