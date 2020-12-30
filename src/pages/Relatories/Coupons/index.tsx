import React, { useCallback, useEffect, useMemo, useState } from 'react'

import InfiniteScrollTable from '@components/InfiniteScrollTable'
import useGoTo from '@hooks/useGoTo'
import usePagination from '@hooks/usePagination'
import useRequest from '@hooks/useRequest'
import styled from 'styled-components'

import { Filters } from './Filters'


const Coupons = () => {

  const [ filters, setFilters ] = useState<any>()
  const [ periodType, setPeriodType ] = useState<string>( 'Mensal' )
  const params = useMemo( () => filters, [ filters ] )
  const pagination = usePagination<any>( '/relatories/coupons',
    {
      initialPageNumber: 0,
      limitParamKey: 'per',
      params
    }
  )
  const programs = useRequest<Coupons.Programs[]>( '/programs' )

  const goTo = useGoTo()

  useEffect( () => {

    console.log( filters )

  }, [ filters ] )


  useEffect( () => {

    if( !programs.loading && !programs.data && !programs.error ){
      programs.send()
    }

  }, [ programs ] )

  const onClickItem = useCallback( ( associate: any ) => {
    goTo( `/associates/${associate.id}` )
  }, [ goTo ] )

  return (
    <Container>
      <ValignWWrapper>
        <PageTitle>Relatórios</PageTitle>

        <Filters
          periodType={ periodType }
          onChangePeriodType={ ( value:any ) => setPeriodType( value ) }
          onChangePeriod={ ( value ) => {
            setFilters( ( filters:any ) => ( { ...filters, ...value } ) )
          } }
        />

      </ValignWWrapper>

      <h2> Cupons gerados </h2>

      <InfiniteScrollTable
        header={ [ 'Parceiro', 'Cupons Gerados' ] }
        columnsClass={ [ 'is-10', 'is-2' ] }
        pagination={pagination}
        onClickItem={onClickItem}
        nodeGenerate={ [
          ( associate ) => associate.name,
          ( associate ) => associate.generated_coupons
        ] }
      />
    </Container>
  )
}

namespace Coupons {
  export interface Programs {
    name: string,
    ID: number | string
  }
  export interface Regions {
    name: string,
  }
}

const ValignWWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin: 0px;
  display: inline-flex;
  margin-right: auto;
`

const Container = styled.div`
  width: 100%;
  padding-top: 60px;
  height: 90%;
  display: flex;
  flex-direction: column;
`

export = Coupons
