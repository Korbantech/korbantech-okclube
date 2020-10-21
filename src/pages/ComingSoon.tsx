import React from 'react'

import logo from '@public/assets/grupo-nd.png'
import styled from 'styled-components'

const ComingSoon = () => 
  <Container>
    <img src={logo} style={ { width: '40%', display: 'flex' } }/>
  </Container>

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export = ComingSoon
