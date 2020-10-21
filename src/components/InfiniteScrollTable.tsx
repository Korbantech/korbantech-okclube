import React, { useCallback, useMemo, ReactNode } from 'react'
import ReactInfiniteScroll from 'react-infinite-scroll-component'

import LoadingContainer from '@components/LoadingContainer'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const InfiniteScrollTable = ( {
  pagination,
  header,
  nodeGenerate,
  columnsClass = [],
  onClickItem
}: InfiniteScrollTable.Props ) => {
  const { loading, load, end, list } = pagination

  const next = useCallback( () => {
    if ( !loading ) return load()
  }, [ loading, load ] )

  const id = useMemo( () => {
    return `${Date.now().toString( 36 )}${( InfiniteScrollTable.instances++ ).toString( 36 )}`
  }, [] )

  const onClickPepare = useCallback( ( item: any ) => {
    if ( onClickItem ) return onClickItem.bind( null, item )
    return undefined
  }, [ onClickItem ] )

  return (
    <Wrapper>
      <Header className="columns">
        {header.map( ( header, index ) => {
          const classes = [ 'column' ]
          if ( columnsClass[index] ) classes.push( columnsClass[index] as string )
          const className = classes.join( ' ' )
          return (
            <HeaderItem className={className} key={`[${id}]header[${index}]:${header}`}>
              {header}
            </HeaderItem>
          )
        } ) }
      </Header>
      <ListContainer id={id}>
        <ReactInfiniteScroll
          dataLength={list.length} //This is important field to render the next data
          next={next}
          hasMore={!end}
          loader={<LoadingContainer />}
          scrollableTarget={id}
        >
          {list.map( ( item, itemIndex ) =>
            <ListItem className='columns'
              style={ { cursor: onClickItem ? 'pointer' : onClickItem } }
              onClick={onClickPepare( item )}
            >
              { header.map( ( header, index ) => {
                if ( !nodeGenerate[index] ) throw new Error( 'not find node generate in position header' )
                const classes = [ 'column' ]
                if ( columnsClass[index] ) classes.push( columnsClass[index] as string )
                const className = classes.join( ' ' )
                return (
                  <ListItemColumn className={className}
                    key={`[${id}]item[${itemIndex}]:header${header}[${index}]`}>
                    {nodeGenerate[index]( item )}
                  </ListItemColumn>
                )
              } ) }
            </ListItem>
          )}
        </ReactInfiniteScroll>
      </ListContainer>
    </Wrapper>
  )
}

InfiniteScrollTable.instances = 0

const Header = styled.div`
  background-color: #F2F2F5;
  margin: 0!important;
`

const HeaderItem = styled.div`
  font: normal normal bold 16px/40px Roboto;
  color: #1E1E1E;
`

const ListContainer = styled.div`
  border: 1px solid darkgrey;
  overflow-y: scroll;
  max-height: 88%;
`

const ListItem = styled.div`
  border-bottom: 1px solid lightgrey;
  margin: 0!important;
`

const ListItemColumn = styled.div``

const Wrapper = styled.div`
  background-color: white;
  padding: 10px 0 1px;
  max-height: 95vh;
  overflow: hidden;
`

namespace InfiniteScrollTable {
  export type Pagination = ReturnType<typeof usePagination>
  export interface Props {
    header: string[]
    nodeGenerate: ( ( item: any ) => ReactNode )[]
    columnsClass?: ( string | undefined )[]
    pagination: Pagination
    onClickItem?: ( item: any ) => void
  }
}

export = InfiniteScrollTable
