import React, { useMemo } from 'react'
import { FaTicketAlt } from 'react-icons/fa'
import { ImClipboard } from 'react-icons/im'

import ConsolidatedResumCard from '@components/ConsolidateResumCard'
import styled from 'styled-components'
import { MONTHS } from '@constants/index'

const MonthlyResum = ( { answeredPolls, generatedCoupons }:Props ) => {

  const currentMonth = useMemo( ():string => {
    return MONTHS[ new Date().getMonth() ].toString()
  }, [] )

  return <CardsContainer>
    <Title> Mensal </Title>
    <ConsolidatedResumCard
      period={ currentMonth }
      amount={ generatedCoupons }
      icon={ () => <FaTicketAlt size={ 30 } color="white" /> }
      backgroudColor='#2D8ADC'
      amountLabel="Cupons Gerados"
    />
    <ConsolidatedResumCard
      period={ currentMonth }
      amount={ answeredPolls }
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

interface Props {
  answeredPolls: number
  generatedCoupons: number
}

export = MonthlyResum
