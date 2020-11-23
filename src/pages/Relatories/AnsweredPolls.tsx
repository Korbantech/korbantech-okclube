import React, { useCallback, useEffect } from 'react'

import CustomSelect from '@components/CustomSelect'
import InfiniteScrollTable from '@components/InfiniteScrollTable'
import useGoTo from '@hooks/useGoTo'
import usePagination from '@hooks/usePagination'
import useRequest from '@hooks/useRequest'
import styled from 'styled-components'



const AnsweredPolls = () => {

  const pagination = usePagination<any>( '/polls' )
  const programsRequest = useRequest<any[]>( '/programs' )
  const locationRequest = useRequest<any[]>( 'https://ndmais.com.br/wp-json/ndmais/v1/content/filters/location/' )
  const goTo = useGoTo()

  useEffect( () => {
    if ( !programsRequest.init ) programsRequest.send()
    if ( !locationRequest.init ) locationRequest.send()
  }, [ programsRequest, locationRequest ] )

  const onClickItem = useCallback( ( poll: any ) => {
    goTo( `/polls/${poll.id}/details` )
  }, [ goTo ] )

  return (
    <Container>
      <PageTitle>Relatórios</PageTitle>

      <CustomSelect label="Teste">
        <CustomSelect.Option value={ 1 } > Teste </CustomSelect.Option>
        <CustomSelect.Option value={ 2 } > Teste 2 </CustomSelect.Option>
      </CustomSelect>

      <InfiniteScrollTable
        header={ [ 'Enquete', 'Programa', 'Região', 'Editar', 'Deletar' ] }
        columnsClass={ [ 'is-6', 'is-2', 'is-2' ] }
        pagination={pagination}
        onClickItem={onClickItem}
        nodeGenerate={ [ () => 'testte', () => 'teste', () => 'teste', () => 'teste', () => 'teste' ] }
      />
    </Container>
  )
}

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  display: inline-flex;
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 60px;
`

export = AnsweredPolls
