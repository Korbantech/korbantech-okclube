import React from 'react'

import styled from 'styled-components'


const Coupons = () => {
  return (
    <Container>
      <PageTitle>Relatórios</PageTitle>

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

export = Coupons
