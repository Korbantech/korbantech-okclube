import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'

const Screen = ( { ...props }: Screen.Props ) =>
  <Screen.Styled {...props}/>

Screen.Styled = styled.div``

namespace Screen {
  export interface Props extends PropsWithChildren<{}> {}
}

export default Screen
