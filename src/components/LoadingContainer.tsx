import React from 'react'

import styled from 'styled-components'

import Loading from './Loading'

const LoadingContainer = ( { size = 50 }: LoadingContainer.Props ) => {
  return (
    <Loader>
      <Loading size={size}/>
      <h4>Carregando...</h4>
    </Loader>
  )
}

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`

namespace LoadingContainer {
  export interface Props {
    size?: number
  }
}

export = LoadingContainer
