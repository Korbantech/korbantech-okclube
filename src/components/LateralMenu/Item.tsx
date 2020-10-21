
import React, { PropsWithChildren, useMemo } from 'react'
import { IconType } from 'react-icons'
import { NavLink, useLocation } from 'react-router-dom'

import { NEUTRAL_COLOR } from '@constants/colors'
import styled from 'styled-components'


const LateralMenuItem = ( props: LateralMenuItem.Props ) => {
  return <LateralMenuItemWithoutChildrens {...props}/>
}

const LateralMenuItemWithoutChildrens = ( { to, text, exact = false }: LateralMenuItem.Props ) => {
  const location = useLocation()

  const isActive = useMemo( () => {
    if ( !exact )
      return !!location.pathname.match( to )
    return location.pathname === to
  }, [ location, to, exact ] )

  const backgroundColor = useMemo( () => {
    if ( isActive ) return 'white'
    else return NEUTRAL_COLOR
  }, [ isActive ] )

  return (
    <Container style={ { backgroundColor } }>
      <LateralMenuItemRow>
        <Link to={to}>{text}</Link>
      </LateralMenuItemRow>
    </Container>
  )
}

const LateralMenuItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Container = styled.li`
  padding: 5px 10px;
  margin: 10px 0;
`

const Link = styled( NavLink )`
  text-decoration: none;
  margin: 0 10px;
  text-align: left;
  font: normal normal medium 20px/26px Roboto;
  letter-spacing: 0px;
  color: #1A1A1A;
`

namespace LateralMenuItem {
  export interface Props extends PropsWithChildren<{}> {
    to: string
    text: string
    icon?: IconType
    exact?: boolean
  }
}

export = LateralMenuItem
