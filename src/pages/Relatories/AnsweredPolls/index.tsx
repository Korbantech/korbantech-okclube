import React, { useCallback, useEffect, useMemo, useState } from 'react'

import InfiniteScrollTable from '@components/InfiniteScrollTable'
import useGoTo from '@hooks/useGoTo'
import usePagination from '@hooks/usePagination'
// import useRequest from '@hooks/useRequest'
// import api from '@app/api'
import styled from 'styled-components'
import useRequest from '@hooks/useRequest'
import { Filters } from './Filters'


const AnsweredPolls = () => {

  const [ filters, setFilters ] = useState<any>()
  const [ periodType, setPeriodType ] = useState<string>( 'Mensal' )
  const params = useMemo( () => ( { restrict: true, ...filters } ), [ filters ] )
  const pagination = usePagination<any>( '/relatories/answered-polls', { params } )
  const programs = useRequest<AnsweredPolls.Programs[]>( '/programs' )
  const regions = useRequest<any[]>( 'https://ndmais.com.br/wp-json/ndmais/v1/content/filters/location/' )
  const goTo = useGoTo()

  useEffect( () => {

    console.log( filters )

  }, [ filters ] )


  useEffect( () => {

    if( !programs.loading && !programs.data && !programs.error ){
      programs.send()
    }
    if( !regions.loading && !regions.data && !regions.error ){
      regions.send()
    }

  }, [ programs, regions ] )

  const onClickItem = useCallback( ( poll: any ) => {
    goTo( `/polls/${poll.id}/details` )
  }, [ goTo ] )

  return (
    <Container>
      <ValignWWrapper>
        <PageTitle>Relatórios</PageTitle>

        <Filters
          programs={ programs.response?.data ?? [] }
          regions={ regions.response?.data ?? [] }
          periodType={ periodType }
          onChangeProgram={ ( value ) => setFilters( ( filters:any ) => ( { ...filters, program: value } ) ) }
          onChangeRegion={ ( value ) => {
            setFilters( ( filters:any ) => ( { ...filters, location: value } ) )
          }}
          onChangePeriodType={ ( value:any ) => setPeriodType( value ) }
          onChangePeriod={ ( value ) => {
            setFilters( ( filters:any ) => ( { ...filters, ...value } ) )
          } }
        />
      </ValignWWrapper>

      <h2> Enquetes respondidas </h2>

      <InfiniteScrollTable
        header={ [ 'Enquete', 'Programa', 'Local', 'Respostas' ] }
        columnsClass={ [ 'is-6', 'is-2', 'is-2' ] }
        pagination={pagination}
        onClickItem={onClickItem}
        nodeGenerate={ [
          ( poll ) => poll.text,
          ( poll ) => {
            const program = programs.data?.find( program => program.ID === parseInt( poll.program, 10 ) )
            if ( !program )
              return 'NA'

            return program.name
          },
          ( poll ) => {
            const location = regions.data?.find( region => region.slug === poll.location )
            if ( !location )
              return 'NA'

            return location.name
          },
          ( poll ) => poll.responses
        ] }
      />
    </Container>
  )
}

namespace AnsweredPolls {
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
  height: 100%;
  padding-top: 60px;
`

export = AnsweredPolls
