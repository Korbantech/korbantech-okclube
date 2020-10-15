import React, { useCallback } from 'react'
import ReactInfiniteScroll from 'react-infinite-scroll-component'
import { Link } from 'react-router-dom'

import Loading from '@components/Loading'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const NotificationList = () => {
  const { loading, load, list, end } = usePagination<any>( '/notifications' )

  const next = useCallback( () => {
    if ( !loading ) return load()
  }, [ loading, load ] )

  return (
    <Container>
      <Row>
        <h2>Notificações</h2>
        <CustomLink to='/associates/create'>
          adicionar novo
        </CustomLink>
      </Row>
      <Wrapper>
        <GridHeader>
          <p>Título</p>
          <p>Enviado em</p>
          <p>Enviado por</p>
          <p>Sucessos</p>
          <p>Falhas</p>
        </GridHeader>
        <Scroll id='associated-scrollable-list'>
          <CustomInfiniteScroll
            dataLength={list.length} //This is important field to render the next data
            next={next}
            hasMore={!end}
            loader={(
              <Loader>
                <Loading size={50}/>
                <h4>Carregando...</h4>
              </Loader>
            )}
            scrollableTarget='associated-scrollable-list'
          >
            {list.length
              ? list.map( notification =>
                <GridItem key={`notification-${notification.id}`}>
                  <div>{notification.title}</div>
                  <div>{new Date( notification.created_at ).toLocaleString( 'pt-BR' )}</div>
                  <div>{notification.user.name}</div>
                  <div>{notification.success}</div>
                  <div>{notification.failure}</div>
                </GridItem>
              )
              : <h5>Nenhuma notificação enviada</h5> }
          </CustomInfiniteScroll>
        </Scroll>
      </Wrapper>
    </Container>
  )
}

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`

const CustomInfiniteScroll = styled( ReactInfiniteScroll )``

const Scroll = styled.div`
  overflow-y: scroll;
  height: 91%;
  ::-webkit-scrollbar { width: 0; }
`

const Grid = styled.div`
  display: grid;
  grid-template-areas: "title send_at send_by success failure";
  grid-auto-columns: 1fr 1fr 1fr 0.5fr 0.5fr;
  grid-gap: 10px;
  padding-right: 10px;
`

const GridHeader = styled( Grid )`
  background-color: white;
  box-shadow: 0 5px 5px 0 #00000040;
`

const GridItem = styled( Grid )`
  border-bottom: 1px #eeeeee solid;
  padding: 10px 0;
`

const Wrapper = styled.div`
  background-color: white;
  box-shadow: 0 0 5px 0 #00000040;
  padding: 10px 0;
  max-height: 95vh;
  overflow: hidden;
  border-radius: 5px;
`

const Container = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
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


namespace NotificationList {}

export = NotificationList
