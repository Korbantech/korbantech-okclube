/* eslint-disable array-element-newline */
import React, { ReactNode, ComponentType, useCallback, useState, useMemo, useRef, useEffect, memo, PropsWithChildren } from 'react'

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
  componentsInListIndex,
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

  const listNode = useMemo( () => {
    console.log( 'list node rendering' )
    if ( !Array.isArray( listAs ) )
      return (
        <MemoredList as={listAs} {...listProps}>
          {data.length ? data.map( ( item, index ) => 
            <MemoredItem key={keyExtractor( item, index )} as={itemAs} {...itemProps}>
              {render( item, index )}
            </MemoredItem>
          ) : !!ListEmptyComponent && <ListEmptyComponent /> }
        </MemoredList>
      )

    if ( !listAs.length ) throw new Error( '' )

    const List = listAs.reduce( ( LastNode, listAs, index ) => {
      return ( { children }: PropsWithChildren<{}> ) =>
        <LastNode>
          <MemoredList as={listAs} {...listProps}>
            { index === componentsInListIndex && !!ListHeaderComponent && <ListHeaderComponent /> }
            {children}
            { index === componentsInListIndex && !!ListFooterComponent && <ListFooterComponent /> }
          </MemoredList>
        </LastNode>
    }, ( { children }: PropsWithChildren<{}> ) => <>{children}</> )

    return (
      <List>
        {data.length ? data.map( ( item, index ) => 
          <MemoredItem key={keyExtractor( item, index )} as={itemAs} {...itemProps}>
            {render( item, index )}
          </MemoredItem>
        ) : !!ListEmptyComponent && <ListEmptyComponent /> }
      </List>
    )
  }, [ data, itemAs, itemProps, listProps, listAs, render, keyExtractor,
    ListEmptyComponent, ListHeaderComponent, ListFooterComponent, componentsInListIndex ] )
  
  const node = useMemo( () => 
    <Container {...props} as={containerAs} onScroll={onScroll}  ref={ref}>
      { !!ListHeaderComponent && componentsInListIndex === undefined && <ListHeaderComponent /> }
      {listNode}
      { !!ListFooterComponent && componentsInListIndex === undefined && <ListFooterComponent /> }
    </Container>
  , [ listNode, onScroll, containerAs, ListHeaderComponent, ListFooterComponent, props, componentsInListIndex ] )

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
    listAs?: keyof JSX.IntrinsicElements | ( keyof JSX.IntrinsicElements )[]
    itemAs?: keyof JSX.IntrinsicElements
    listProps?: ListProps
    itemProps?: ItemProps
    keyExtractor?: ( item: T, index: number ) => string
    onReachedEnd?: () => void
    componentsInListIndex?: number
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
  width: 100%;
`

type ItemProps = typeof Item extends ComponentType<infer P> ? P : never

const Item = styled.li``

const MemoredList = memo( List )

const MemoredItem = memo( Item )

export = ListWithEnd
