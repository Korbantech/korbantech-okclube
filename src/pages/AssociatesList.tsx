import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import ReactInfiniteScroll from 'react-infinite-scroll-component'
import { Link } from 'react-router-dom'

import api from '@app/api'
import Loading from '@components/Loading'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const AssociatesList = () => {
  const [ text, setText ] = useState( '' )

  const [ like, setSearch ] = useState( '' )

  useEffect( () => {
    const timeout = setTimeout( () => {
      setSearch( text )
    }, 400 )
    return () => clearTimeout( timeout )
  }, [ text ] )

  const params = useMemo( () => ( { order: 'updated_at', desc: true, like } ), [ like ] )

  const { loading, load, reset, list, end } = usePagination<any>( '/associates', {
    initialPageNumber: 0,
    limitParamKey: 'per',
    params
  } )

  useEffect( () => reset(), [ params, reset ] )

  const next = useCallback( () => {
    if ( !loading ) return load()
  }, [ loading, load ] )

  return (
    <Container>
      <Row>
        <h2>Associados</h2>
        <CustomLink to='/associates/create'>
          adicionar novo
        </CustomLink>
      </Row>
      <Input className='input' placeholder='Procurar Associado' value={text}
        onChange={ ( event ) => setText( event.target.value ) }/>
      <Wrapper>
        <GridHeader>
          <p />
          <p>Nome</p>
          <p>Endereços</p>
          <p>Categoria</p>
          <p>Editar</p>
          <p>Excluir</p>
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
            {list.map( associated =>
              <GridItem key={`associated-${associated.id}`}>
                <Logo src={associated.logo}/>
                <Name>{associated.name}</Name>
                <Addresses>
                  {associated.address.map( ( address: string, index: number ) => 
                    <Address key={`associated-address-${associated.id}-${index}`}>
                      {address}
                    </Address>
                  )}
                </Addresses>
                <Category>{associated.category}</Category>
                <FaEditLink to={`/associates/${associated.id}`}>
                  <CustomFaEdit />
                </FaEditLink>
                <CustomFaTrashAlt onClick={ () => {
                  // eslint-disable-next-line no-alert
                  if ( confirm( 'Deseja mesmo excluir o associado?' ) )
                    api.delete( `/associates/${associated.id}` )
                      .then( () => reset() )
                } }/>
              </GridItem>
            )}
          </CustomInfiniteScroll>
        </Scroll>
      </Wrapper>
    </Container>
  )
}

const Input = styled.input``

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`

const Addresses = styled.div`
  margin: auto 0;
`

const Address = styled.p`
  margin: auto 0;
`

const Logo = styled.img`
  width: 100%;
`

const Name = styled.p`
  margin: auto 0;
`

const Category = styled.p`
  margin: auto 0;
`

const CustomInfiniteScroll = styled( ReactInfiniteScroll )``

const Scroll = styled.div`
  overflow-y: scroll;
  height: 91%;
  ::-webkit-scrollbar { width: 0; }
`

const Grid = styled.div`
  display: grid;
  grid-template-areas: "photo name addresses category edit-action delete-action";
  grid-auto-columns: 70px 2fr 2fr 1fr .2fr .2fr;
  grid-gap: 10px;
  padding-right: 10px;
`

const GridHeader = styled( Grid )`
  background-color: white;
  box-shadow: 0 5px 5px 0 #00000040;
`

const GridItem = styled( Grid )`
  border-bottom: 1px #eeeeee solid;
`

const CustomFaEdit = styled( FaEdit )`
  cursor: pointer;
  display: flex;
  margin: auto;
`

const FaEditLink = styled( Link )`
  display: flex;
  margin: auto;
  color: black;
`

const CustomFaTrashAlt = styled( FaTrashAlt )`
  cursor: pointer;
  display: flex;
  margin: auto;
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

namespace AssociatesList {}

export = AssociatesList
