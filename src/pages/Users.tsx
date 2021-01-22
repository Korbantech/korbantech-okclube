import React, { useState, useMemo, useCallback } from 'react'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import api from '@app/api'
import InfiniteScrollTable from '@components/InfiniteScrollTable'
import InputWithDelay from '@components/InputWithDelay'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const Users = () => {
  const [ like, setSearch ] = useState( '' )

  const params = useMemo( () => ( { order: 'updated_at', desc: true, like } ), [ like ] )

  const pagination = usePagination<any>( '/users', {
    initialPageNumber: 0,
    limitParamKey: 'per',
    params
  } )

  const onChange = useCallback( ( event: React.ChangeEvent<HTMLInputElement> ) => {
    setSearch( event.target.value )
  }, [] )

  return (
    <Container>
      <div className="columns is-align-items-center" style={ { margin: 0 } }>
        <div className="column is-5">
          <Title>Usuários</Title>
        </div>
        <div className="column is-3" />
        <div className="column is-4">
          <Search onChange={onChange} placeholder='Procurar usuários...'/>
        </div>
      </div>
      <InfiniteScrollTable
        header={ [ 'Nome', 'Email', 'Documento', 'Assinante', 'Editar', 'Deletar' ] }
        columnsClass={ [ 'is-3', 'is-4', 'is-2', 'is-1', 'is-1', 'is-1' ] }
        pagination={pagination}
        nodeGenerate={ [
          user => user.name,
          user => user.mail,
          user => user.document,
          user => new Date( user.valid ) >= new Date() ? 'Sim' : 'Não',
          user =>
            <Link to={`/users/${user.id}`} style={ { color: 'currentColor' } }>
              <FaEdit />
            </Link>,
          user => <FaTrashAlt style={ { cursor: 'pointer' } } onClick={ () => {
            // eslint-disable-next-line no-alert
            if ( confirm( 'Deseja mesmo excluir o associado?' ) )
              api.delete( `/user/${user.id}` )
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

const Title = styled.h2`
  text-align: left;
  font: normal normal bold 32px/40px Roboto;
  letter-spacing: 0px;
  color: #1E1E1E;
  opacity: 1;
`

const Search = styled( InputWithDelay )`
  background: #FFFFFF 0% 0% no-repeat padding-box;
  border: 1px solid #707070;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
`

export default Users
