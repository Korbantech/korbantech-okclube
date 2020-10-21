/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import React, { useCallback, useState, useMemo } from 'react'

import InfiniteScrollTable from '@components/InfiniteScrollTable'
import ScreenHeaderWithSearch from '@components/ScreenHeaderWithSearch'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const NotificationList = () => {
  const [ search, setSearch ] = useState( '' )

  const params = useMemo( () => ( { search } ), [ search ] )

  const pagination = usePagination<any>( '/notifications', { params } )

  const onChange = useCallback( ( search: string ) => {
    setSearch( search )
  }, [] )

  return (
    <Container>
      <ScreenHeaderWithSearch
        title='Notificações'
        rightButtonText='Nova Notificação'
        rightButtonTo='/notifications/create'
        searchInputPlaceholder='Buscar notificação...'
        onSearchChange={onChange} />
      <InfiniteScrollTable
        header={ [ 'Título', 'Data de envio', 'Enviado por', 'Sucessos', 'Falhas' ] }
        pagination={pagination}
        columnsClass={ [ 'is-4', 'is-3', 'is-3' ] }
        nodeGenerate={ [
          notification => notification.title,
          notification => new Date( notification.created_at ).toLocaleString( 'pt-BR' ),
          notification => notification.user.name,
          notification => notification.success,
          notification => notification.failure,
        ] }
      />
    </Container>
  )
}
const Container = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
`

namespace NotificationList {}

export = NotificationList
