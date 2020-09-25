import React, { useState, useEffect, useCallback, useMemo } from 'react'

import useRequest from '@hooks/useRequest'
import styled from 'styled-components'

const PollItemList = ( { poll }: PollItemList.Props ) => {
  const [ open, setOpen ] = useState( false )
  const request = useRequest<any>( `/polls/${poll.id}/details` )

  useEffect( () => {
    if ( open && !request.init ) request.send()
  }, [ open, request ] )

  const toggleAdditionalInformation = useCallback( () => {
    setOpen( open => !open )
  }, [] )

  const data = useMemo( () => {
    return Object.assign( { yes: 0, no: 0 }, request.data?.responses || {} )
  }, [ request.data ] )

  const total = useMemo( () => data.yes + data.no, [ data ] )

  const percent = useMemo( () => {
    return Object.fromEntries(
      Object.entries<number>( data )
        .map( ( [ key, qty ] ) => [ key, total ? qty * 100 / total : 0 ] )
    )
  }, [ total, data ] )

  return (
    <Container onClick={ toggleAdditionalInformation }>
      <InlinePoll>
        <Text>
          {poll.text}
        </Text>
        <ActionsContainer />
      </InlinePoll>
      { open && 
        <AdditionalInformation>
          {request.loading || !request.init
            ? <p>Carregando...</p>
            : 
            <div>
              <h4>Total de votos: {total} | Total de comentários: {request.data?.comments_count}</h4>
              <p>Sim: {data.yes}( {percent.yes}% )</p>
              <p>Não: {data.no}( {percent.no}% )</p>
            </div>
          }
        </AdditionalInformation>
      }
    </Container>
  )
}

const Container = styled.div`
  background-color: white;
  padding: 5px 10px;
  border-bottom: 1px #cccccc60 solid;
  transition: .3s ease;
  cursor: pointer;
`

const InlinePoll = styled.div`
  width: 100%;
`

const Text = styled.div``

const ActionsContainer = styled.div``

const AdditionalInformation = styled.div``

namespace PollItemList {
  export interface Props {
    poll: any
  }
}

export = PollItemList
