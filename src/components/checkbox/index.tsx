import React from 'react'

import styled from 'styled-components'

const Checkbox = ( { on, off, onColor, offColor, ...props }: Checkbox.Props ) =>
  <Checkbox.Container>
    <Checkbox.Input {...props} onColor={ onColor }/>
    <Checkbox.Label on={ on || 'ON' } off={ off || 'OFF' } offColor={ offColor }/>
  </Checkbox.Container>

Checkbox.Container = styled.div``

Checkbox.Label = styled.label<Checkbox.LabelProps>`
  overflow: hidden;
  transform: skew( -10deg );
  transition: all .2s ease;
  background: ${ props => props.offColor || '#888' };
  ::before, &::after {
    transform: skew(10deg);
    display: inline-block;
    transition: all .2s ease;
    width: 100%;
    text-align: center;
    position: absolute;
    line-height: 2em;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  }
  ::before {
    left: 0;
    content: ${ props => props.off };
  }
  ::after {
    left: 50%;
    content: ${ props => props.on };
  }
`

Checkbox.Input = styled.input<Checkbox.InputProps>`
  display: none;
  :checked {
    ${Checkbox.Label} {
      background: ${ props => props.onColor || '#86d993' };
      ::before {
        left: -100%;
      }
      ::after {
        left: 0;
      }
    }
  }
`

namespace Checkbox {
  export interface Props {
    name: string
    on?: string
    off?: string
    offColor?: string
    onColor?: string
  }
  export interface LabelProps {
    on: string
    off: string
    offColor?: string
  }
  export interface InputProps {
    onColor?: string
  }
}

export default Checkbox
