import React from 'react'

import styled, { keyframes } from 'styled-components'

const Loading = ( { size = 100 }: Loading.Props ) =>
  <Wrapper size={size}>
    <Container>
      <hr />
      <hr />
      <hr />
      <hr />
    </Container>
  </Wrapper>

namespace Loading {
  export interface Props {
    size?: number
  }
}

const loadingAnimation = keyframes`
  0%,100% { transform:translate( 0 ) }
  25%{ transform:translate( 160% ) }
  50% { transform:translate( 160%, 160% ) }
  75%{ transform:translate( 0, 160% ) }
`

const Wrapper = styled.div<Loading.Props>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  > * {
    border: 0;
    margin: 0;
    width: 40%;
    height: 40%;
    position: absolute;
    border-radius: 50%;
    animation: ${loadingAnimation} 2s ease infinite;
  }
  > :first-child {
    background: #19A68C;
    animation-delay: -1.5s
  }
  > :nth-child( 2 ) {
    background: #F63D3A;
    animation-delay: -1s
  }
  > :nth-child( 3 ){
    background: #FDA543;
    animation-delay: -0.5s
  }
  > :last-child {
    background: #193B48
  }
`

export = Loading
