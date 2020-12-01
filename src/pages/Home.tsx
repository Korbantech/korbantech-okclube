import React, { useCallback, useEffect, useState } from 'react'

import api from '@app/api'
import MonthlyResum from '@components/MonthlyResum'
import WeekResum from '@components/WeekResum'
import styled from 'styled-components'


const Home = () => {

  const [ answeredPolls, setAnsweredPolls ] = useState<AnsweredPolls>( { week: 0, month: 0 } )
  const [ generatedCoupons, setGeneratedCoupons ] = useState<GeneratedCoupons>( { week: 0, month: 0 } )

  const loadCouponsData = useCallback( async () => {
    const { week, month } = await api.get( 'relatories/coupons/count' )
      .then( res => res.data )
      .catch( err => {
        console.log( err )
        return {
          week: 0,
          month: 0
        }
      } )
    setGeneratedCoupons( {
      week,
      month
    } )
  }, [] )

  const loadAnsweredPollsData = useCallback( async () => {
    const { week, month } = await api.get( 'relatories/answered-polls/count' )
      .then( res => res.data )
      .catch( err => {
        console.log( err )
        return {
          week: 0,
          month: 0
        }
      } )
    setAnsweredPolls( {
      week,
      month
    } )
  }, [] )

  useEffect( () => {
    loadCouponsData()
    loadAnsweredPollsData()
  }, [ loadCouponsData, loadAnsweredPollsData ] )

  return (
    <Container>
      <PageTitle>Resumo Consolidado</PageTitle>
      <WeekResum answeredPolls={answeredPolls.week} generatedCoupons={ generatedCoupons.week } />
      <MonthlyResum answeredPolls={answeredPolls.month} generatedCoupons={ generatedCoupons.month } />
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

type AnsweredPolls = {
  week: number,
  month: number
}
type GeneratedCoupons = {
  week: number,
  month: number
}

export = Home
