import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'

const ConsolidatedResumCard = ( { backgroudColor, icon: Icon, ...props }:Props ) => {

  return (

    <Card  backgroudColor={ backgroudColor } >

      { !props.period ? null :
        <CardPeriod>
          { props.period }
        </CardPeriod>
      }

      { !Icon ? null :
        <CardIcon>
          <Icon />
        </CardIcon>
      }

      <Cardfill />

      <CardAmount>
        { props.amount ?? 0 }
      </CardAmount>

      { !props.amountLabel ? null :
        <CardAmountLabel>
          { props.amountLabel }
        </CardAmountLabel>
      }

    </Card>

  )
}


type CardProps = {
  backgroudColor?: string
}

const Card = styled.div<CardProps>`
  padding: 16px;
  width: 330px;
  height: 145px;
  background-color: ${ props => props.backgroudColor ?? 'transparent' };
  position: relative;
  display: flex;
  flex-direction: column;
  &:not(:first-of-type){
    margin-left: 20px;
  }
  border-radius: 4px;
`
const Cardfill = styled.div`
  flex: 1;
`

const CardIcon = styled.div`
  font-weight: 400;
  font-size: 16px;
  color: white;
  width: 40px;
  height: 40px;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
`

const CardAmount = styled.div`
  font-weight: 500;
  font-size: 40px;
  color: white;
  text-align: center;
  width: 100%;
  align-self: flex-end;
`

const CardAmountLabel = styled.div`
  font-weight: 400;
  font-size: 16px;
  color: white;
  text-align: center;
  line-height: 20px;
`

const CardPeriod = styled.div`
  font-weight: 400;
  font-size: 16px;
  color: white;
  text-transform: capitalize;
  width: 100%;
`


interface Props extends PropsWithChildren <{}>{
  amount?: number,
  amountLabel?: string,
  backgroudColor?: string,
  icon?: React.ComponentType<{}>,
  period?: string,
}



export = ConsolidatedResumCard