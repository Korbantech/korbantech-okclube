import React, { PropsWithChildren, useMemo, useState, useCallback } from 'react'
import { IconType } from 'react-icons'
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { NavLink, useLocation } from 'react-router-dom'

import styled from 'styled-components'


const LateralMenuItem = ( props: LateralMenuItem.Props ) => {
  const hasChildren = useMemo( () => !!props.children, [ props.children ] )

  if ( hasChildren ) return <LateralMenuItemWithChildrens {...props}/>

  return <LateralMenuItemWithoutChildrens {...props}/>
}

const LateralMenuItemWithoutChildrens = ( { to, text, icon: Icon }: LateralMenuItem.Props ) => {
  const location = useLocation()

  const isActive = useMemo( () => !!location.pathname.match( to ), [ location, to ] )

  const color = useMemo( () => isActive ? '#363636' : '#53728E', [ isActive ] )

  return (
    <Container>
      <LateralMenuItemRow>
        { !!Icon && 
          <Link to={to}>
            <Icon color={color}/>
          </Link>
        }
        <Link to={to}>{text}</Link>
      </LateralMenuItemRow>
    </Container>
  )
}

const LateralMenuItemWithChildrens = ( { to, text, icon: Icon, children }: LateralMenuItem.Props ) => {
  const location = useLocation()

  const isActive = useMemo( () => !!location.pathname.match( to ), [ location, to ] )
  
  const [ open, setOpen ] = useState( isActive )

  const clickChevron = useCallback( () => setOpen( open => !open ), [] )

  const color = useMemo( () => isActive ? '#363636' : '#53728E', [ isActive ] )

  return (
    <Container>
      <LateralMenuItemRow>
        { !!Icon &&
          <Link to={to}>
            <Icon color={color}/>
          </Link>
        }
        <Link to={to}>{text}</Link>
        { open
          ? <FaChevronLeft size={12} color={color} onClick={clickChevron}/>
          : <FaChevronRight size={12} color={color} onClick={clickChevron}/> }
      </LateralMenuItemRow>
      { open && 
        <LateralMenuItemSubList>
          {children}
        </LateralMenuItemSubList>
      }
    </Container>
  )
}

const LateralMenuItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const LateralMenuItemSubList = styled.ul`
  margin: 0 0 0 5px;
  padding: 0;
  list-style: none;
`

const Container = styled.li`
  padding: 5px 10px;
  margin: 10px 0;
`

const Link = styled( NavLink )`
  text-decoration: none;
  margin: 0 10px;
  color: #53728E;
  &.active {
    color: #363636;
  }
`

namespace LateralMenuItem {
  export interface Props extends PropsWithChildren<{}> {
    to: string
    text: string
    icon?: IconType
  }
}

export = LateralMenuItem
