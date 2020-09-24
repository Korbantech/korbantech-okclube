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

  const color = useMemo( () => isActive ? 'rgba(255,255,255,.7)' : '#53728E', [ isActive ] )

  return (
    <Container>
      <LateralMenuItemRow>
        { !!Icon && 
          <NavLink to={to}>
            <Icon color={color} />
          </NavLink>
        }
        <Link to={to} color={color}>{text}</Link>
      </LateralMenuItemRow>
    </Container>
  )
}

const LateralMenuItemWithChildrens = ( { to, text, icon: Icon, children }: LateralMenuItem.Props ) => {
  const [ open, setOpen ] = useState( false )

  const clickChevron = useCallback( () => setOpen( open => !open ), [] )

  const location = useLocation()

  const isActive = useMemo( () => !!location.pathname.match( to ), [ location, to ] )

  const color = useMemo( () => isActive ? 'rgba(255,255,255,.7)' : '#53728E', [ isActive ] )

  return (
    <Container>
      <LateralMenuItemRow>
        { !!Icon &&
          <NavLink to={to}>
            <Icon color={color} />
          </NavLink>
        }
        <Link to={to} color={color}>{text}</Link>
        { open
          ? <FaChevronLeft color={color} size={12} onClick={clickChevron}/>
          : <FaChevronRight color={color} size={12} onClick={clickChevron}/> }
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
  color: #53728E;
  margin: 0 10px;
  &.active {
    color: rgba(255,255,255,.7);
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
