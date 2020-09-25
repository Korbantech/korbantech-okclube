import React from 'react'
import { Link } from 'react-router-dom'

import ListWithEnd from '@components/ListWithEnd'
import PollItemList from '@components/PollItemList'
import usePagination from '@hooks/usePagination'
import styled from 'styled-components'

const PollsList = () => {
  const pagination = usePagination<any>( '/polls' )

  return (
    <Container>
      <Row>
        <h2>Enquetes</h2>
        <CustomLink to='/polls/create'>
          adicionar novo
        </CustomLink>
      </Row>
      <List
        data={pagination.list}
        render={ poll => <PollItemList poll={poll} /> }
        onReachedEnd={ () => { if ( !pagination.end ) pagination.load() } }
      />
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

const CustomLink = styled( Link )`
  margin: 0 10px;
  background-color: white;
  box-shadow: 0 0 5px 0 #00000020;
  border-radius: 5px;
  text-decoration: none;
  color: blue;
  padding: 5px 10px;
`

const List = styled( ListWithEnd )`
  background-color: white;
  box-shadow: 0 0 5px 0 #00000040;
  border-radius: 5px;
`

namespace PollsList {}

export = PollsList
