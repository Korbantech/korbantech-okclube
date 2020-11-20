import React from 'react'
import { FaTicketAlt } from 'react-icons/fa'
import { ImClipboard } from 'react-icons/im'

import ConsolidatedResumCard from '@components/ConsolidateResumCard'
import styled from 'styled-components'

const MonthlyResum = () => {

  return <CardsContainer>
    <Title> Mensal </Title>
    <ConsolidatedResumCard
      period="Novembro"
      amount={ 234 }
      icon={ () => <FaTicketAlt size={ 30 } color="white" /> }
      backgroudColor='#2D8ADC'
      amountLabel="Cupons Gerados"
    />
    <ConsolidatedResumCard
      period="Novembro"
      amount={ 123 }
      icon={ () => <ImClipboard size={ 30 } color="white" /> }
      backgroudColor='#2D8ADC'
      amountLabel="Enquetes respondidas"
    />
  </CardsContainer>
}

const Title = styled.h3`
  width: 100%;
  font-weight: 500;
  font-size: 24px;
`

const CardsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 40px;
`

export = MonthlyResum
