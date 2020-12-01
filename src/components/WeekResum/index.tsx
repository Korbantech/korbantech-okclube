import React, { useMemo } from 'react'
import { FaTicketAlt } from 'react-icons/fa'
import { ImClipboard } from 'react-icons/im'

import ConsolidatedResumCard from '@components/ConsolidateResumCard'
import { MONTHS_SHORT } from '@constants/index'
import styled from 'styled-components'

const WeekResum = ( { answeredPolls, generatedCoupons }:Props ) => {

  const period = useMemo( ():string => {
    const date = new Date()
    date.setDate( date.getDate() - date.getDay()  )
    const from:Date = new Date( date.getFullYear(), date.getMonth(), date.getDate()  )
    const to:Date = new Date( date.getFullYear(), date.getMonth(), date.getDate() + 6 )

    return `${from.getDate()} ${MONTHS_SHORT[ from.getMonth() ]}`
    + ' - '
    + `${to.getDate()} ${MONTHS_SHORT[ to.getMonth() ]}`

  }, [] )

  return <CardsContainer>
    <Title> Semanal </Title>
    <ConsolidatedResumCard
      period={ period }
      amount={ generatedCoupons }
      icon={ () => <FaTicketAlt size={ 30 } color="white" /> }
      backgroudColor='#2D8ADC'
      amountLabel="Cupons Gerados"
    />
    <ConsolidatedResumCard
      period={ period }
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
  answeredPolls: number,
  generatedCoupons: number
}

export = WeekResum
