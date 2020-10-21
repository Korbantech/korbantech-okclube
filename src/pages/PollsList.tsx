/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import React, { useCallback, useMemo, useState, useEffect } from 'react'

import InfiniteScrollTable from '@components/InfiniteScrollTable'
import Loading from '@components/Loading'
import ScreenHeaderWithSearch from '@components/ScreenHeaderWithSearch'
import useGoTo from '@hooks/useGoTo'
import usePagination from '@hooks/usePagination'
import useRequest from '@hooks/useRequest'
import styled from 'styled-components'

const PollsList = () => {
  const [ search, setSearch ] = useState( '' )
  const params = useMemo( () => ( { search } ), [ search ] )
  const pagination = usePagination<any>( '/polls', { params } )
  const programsRequest = useRequest<any[]>( '/programs' )
  const locationRequest = useRequest<any[]>( 'https://ndmais.com.br/wp-json/ndmais/v1/content/filters/location/' )
  const goTo = useGoTo()
  useEffect( () => {
    if ( !programsRequest.init ) programsRequest.send()
    if ( !locationRequest.init ) locationRequest.send()
  }, [ programsRequest, locationRequest ] )

  const onChange = useCallback( ( search: string ) => {
    setSearch( search )
  }, [] )

  const onClickItem = useCallback( ( poll: any ) => {
    goTo( `/polls/${poll.id}/details` )
  }, [ goTo ] )

  return (
    <Container>
      <ScreenHeaderWithSearch
        title='Enquetes'
        rightButtonText='Nova enquete'
        rightButtonTo='/polls/create'
        searchInputPlaceholder='Buscar enquete...'
        onSearchChange={onChange} />
      <InfiniteScrollTable
        header={ [ 'Enquete', 'Programa', 'Região', 'Editar', 'Deletar' ] }
        columnsClass={ [ 'is-6', 'is-2', 'is-2' ] }
        pagination={pagination}
        onClickItem={onClickItem}
        nodeGenerate={ [
          poll => poll.text,
          poll => {
            if ( programsRequest.loading || !programsRequest.data )
              return <Loading size={12} />
            
            const program = programsRequest.data.find( program => program.ID === poll.program )
            if ( !program )
              return 'NA'
            
            return program.name
          },
          poll => {
            if ( locationRequest.loading || !locationRequest.data )
              return <Loading size={12} />
            
            const location = locationRequest.data.find( program => program.ID === poll.program )
            if ( !location )
              return 'NA'
            
            return location.name
          },
          () => 'item c 4',
          () => 'item c 5',
        ] }
      />
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

namespace PollsList {}

export = PollsList
