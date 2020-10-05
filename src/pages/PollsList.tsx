import React, { useCallback } from 'react'
import ReactInfiniteScroll from 'react-infinite-scroll-component'
import { Link } from 'react-router-dom'

import Loading from '@components/Loading'
import PollItemList from '@components/PollItemList'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const PollsList = () => {
  const pagination = usePagination<any>( '/polls' )

  const next = useCallback( () => {
    if ( !pagination.loading ) return pagination.load()
  }, [ pagination ] )

  return (
    <Container>
      <Row>
        <h2>Enquetes</h2>
        <CustomLink to='/polls/create'>
          adicionar novo
        </CustomLink>
      </Row>
      <Wrapper>
        <Scroll id='associated-scrollable-list'>
          <CustomInfiniteScroll
            dataLength={pagination.list.length} //This is important field to render the next data
            next={next}
            hasMore={!pagination.end}
            loader={(
              <Loader>
                <Loading size={50}/>
                <h4>Carregando...</h4>
              </Loader>
            )}
            scrollableTarget='associated-scrollable-list'
          >
            {pagination.list.map( poll =>
              <PollItemList poll={poll} reset={pagination.reset} />
            )}
          </CustomInfiniteScroll>
        </Scroll>
      </Wrapper>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
`

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`

const Wrapper = styled.div`
  background-color: white;
  box-shadow: 0 0 5px 0 #00000040;
  padding: 10px 0;
  max-height: 95vh;
  overflow: hidden;
  border-radius: 5px;
`

const CustomLink = styled( Link )`
  margin: 0 10px;
  background-color: white;
  box-shadow: 0 0 5px 0 #00000020;
  border-radius: 5px;
  text-decoration: none;
  color: blue;
  padding: 5px 10px;
`

const CustomInfiniteScroll = styled( ReactInfiniteScroll )``

const Scroll = styled.div`
  overflow-y: scroll;
  height: 91%;
  ::-webkit-scrollbar { width: 0; }
`

namespace PollsList {}

export = PollsList
