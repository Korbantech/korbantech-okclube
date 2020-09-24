/* eslint-disable array-element-newline */
import React, { ReactNode, ComponentType, useCallback, useState, useMemo, useRef, useEffect, memo } from 'react'

import styled from 'styled-components'

const ListWithEnd = <T extends any>( {
  data,
  render,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  keyExtractor = ( item, index ) => `item-in-list-${index}`,
  onEndReachedThreshold = .5,
  onReachedEnd,
  containerAs,
  listAs,
  itemAs,
  listProps = {},
  itemProps = {},
  ...props
}: ListWithEnd.Props<T> ) => {
  const [ height, setHeight ] = useState( 0 )
  const [ current, setCurrent ] = useState( 0 )
  const ref = useRef<HTMLElement>( null )

  const onScroll = useCallback( ( event: React.UIEvent<HTMLElement, UIEvent> ) => {
    setCurrent( event.currentTarget.offsetHeight + event.currentTarget.scrollTop )  
  }, [] )

  useEffect( () => {
    if ( ref.current ) {
      setHeight( ref.current.scrollHeight )
      setCurrent( ref.current.offsetHeight + ref.current.scrollTop )
    }
  }, [ data ] )

  const pointReachedEnd = useMemo(
    () => current / height > onEndReachedThreshold,
    [ current, height, onEndReachedThreshold ]
  )

  useEffect( () => {
    if ( pointReachedEnd ) onReachedEnd?.()
  }, [ pointReachedEnd, onReachedEnd ] )
  
  const node = useMemo( () => 
    <Container as={containerAs} {...props}>
      { !!ListHeaderComponent && <ListHeaderComponent /> }
      <MemoredList onScroll={onScroll} ref={ref} as={listAs} {...listProps}>
        {data.length ? data.map( ( item, index ) => 
          <MemoredItem key={keyExtractor( item, index )} as={itemAs} {...itemProps}>
            {render( item, index )}
          </MemoredItem>
        ) : !!ListEmptyComponent && <ListEmptyComponent /> }
      </MemoredList>
      { !!ListFooterComponent && <ListFooterComponent /> }
    </Container>
  , [ onScroll,
    keyExtractor,
    ListEmptyComponent,
    render,
    data,
    containerAs,
    listAs,
    itemAs,
    ListHeaderComponent,
    ListFooterComponent,
    listProps,
    itemProps,
    props ] )

  return node
}

namespace ListWithEnd {
  export interface Props<T> extends ContainerProps {
    data: T[]
    render: ( item: T, index: number ) => ReactNode | null
    onEndReachedThreshold?: number
    ListEmptyComponent?: ComponentType
    ListHeaderComponent?: ComponentType
    ListFooterComponent?: ComponentType
    containerAs?: keyof JSX.IntrinsicElements
    listProps?: ListProps
    itemProps?: ItemProps
    listAs?: keyof JSX.IntrinsicElements
    itemAs?: keyof JSX.IntrinsicElements
    keyExtractor?: ( item: T, index: number ) => string
    onReachedEnd?: () => void
  }
}

type ContainerProps = typeof Container extends ComponentType<infer P> ? P : never

const Container = styled.div`
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 100vh;
`

type ListProps = typeof List extends ComponentType<infer P> ? P : never

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

type ItemProps = typeof Item extends ComponentType<infer P> ? P : never

const Item = styled.li``

const MemoredList = memo( List )

const MemoredItem = memo( Item )

export = ListWithEnd
