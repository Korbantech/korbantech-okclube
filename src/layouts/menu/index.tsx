import React from 'react'
import { NavLink } from 'react-router-dom'

import styled from 'styled-components'

const Menu = ( { items }: Menu.Props ) =>
  <Menu.Styled>
    <ul>
      { items.map( ( item, index ) => 
        <li key={`items[${index}]`}>
          <NavLink to={item.to || '#'}>
            { item.icon ? <i>{item.icon}</i> : null }
            <span>{ item.title }</span>
            { item.options?.length ? <i>Icon to Toggle</i> : null }
            { item.options?.length ? 
              <ul>
                { item.options.map( ( item, indexb ) =>
                  <li key={`items[${index}]options[${indexb}]`}>
                    <NavLink to={ item.to }>
                      <span>{item.title}</span>
                    </NavLink>
                  </li>
                ) }
              </ul>
              : null}
          </NavLink>
        </li>
      ) }
    </ul>
  </Menu.Styled>

Menu.Styled = styled.nav`
  > ul {
    list-style: none;
    margin: 0;
    padding: 0;
    background-color: #eee;
    > li {
      background-color: #ccc;
    }
  }
`

namespace Menu {
  export interface Props {
    items: Item[]
  }
  export interface Item {
    title: string
    icon?: string
    to?: string
    options?: {
      title: string
      to: string
    }[]
  }
}

export default Menu
