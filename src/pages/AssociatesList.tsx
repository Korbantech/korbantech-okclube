/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import React, { useCallback, useMemo, useState } from 'react'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import api from '@app/api'
import InfiniteScrollTable from '@components/InfiniteScrollTable'
import ScreenHeaderWithSearch from '@components/ScreenHeaderWithSearch'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const AssociatesList = () => {
  const [ like, setSearch ] = useState( '' )

  const params = useMemo( () => ( { order: 'updated_at', desc: true, like } ), [ like ] )

  const pagination = usePagination<any>( '/associates', {
    initialPageNumber: 0,
    limitParamKey: 'per',
    params
  } )

  const onChange = useCallback( ( search: string ) => {
    setSearch( search )
  }, [] )

  return (
    <Container>
      <ScreenHeaderWithSearch
        title='Parceiros'
        rightButtonText='Novo parceiro'
        rightButtonTo='/associates/create'
        searchInputPlaceholder='Buscar parceiro...'
        onSearchChange={onChange} />
      <InfiniteScrollTable
        header={ [ '', 'Nome', 'Endereços', 'Categoria', 'Editar', 'Deletar' ] }
        columnsClass={ [ 'is-1', 'is-3', 'is-4', 'is-2' ] }
        pagination={pagination}
        nodeGenerate={ [
          associated => <img src={associated.logo} />,
          associated => associated.name,
          associated => associated.address?.slice( 0, 1 ).join( '' ) ?? null,
          associated => associated.benefit_category,
          associated =>
            <Link to={`/associates/${associated.id}`} style={ { color: 'currentColor' } }>
              <FaEdit />
            </Link>,
          associated => <FaTrashAlt style={ { cursor: 'pointer' } } onClick={ () => {
            // eslint-disable-next-line no-alert
            if ( confirm( 'Deseja mesmo excluir o associado?' ) )
              api.delete( `/associates/${associated.id}` )
                .then( () => pagination.reset() )
          } }/>,
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

namespace AssociatesList {}

export = AssociatesList
