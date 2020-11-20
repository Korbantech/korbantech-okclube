import React from 'react'

import MonthlyResum from '@components/MonthlyResum'
import WeekResum from '@components/WeekResum'
import styled from 'styled-components'


const Home = () => {
  return (
    <Container>
      <PageTitle>Resumo Consolidado</PageTitle>
      <WeekResum />
      <MonthlyResum />
    </Container>
  )
}

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding-top: 60px;
`

export = Home
