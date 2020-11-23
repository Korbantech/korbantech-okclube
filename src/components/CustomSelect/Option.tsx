import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'


class Option extends React.Component<Option.Props>{

  constructor( props:any ) {
    super( props )

    this.handleClick = this.handleClick.bind( this )
  }

  handleClick( ){
    this.props.handleOptionClick && this.props.handleOptionClick( this )
  }

  render() {
    return (
      <StyledOption onClick={ this.handleClick }>
        { this.props.children }
      </StyledOption>
    )
  }

}

type styledProps = {
  height?: string
}
const StyledOption = styled.div<styledProps>`
  width: 100%;
  height: 100vh;
  max-height: ${ props => props.height ?? '40px' };
  padding: 5px 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 0 2px -1px black;
  cursor: pointer;

  &:hover{
    background-color: #ddd;
  }
`

namespace Option{
  export interface Props extends PropsWithChildren<{}>{
    value?: any,
    handleOptionClick?: ( value:any ) => void,
    selected?: boolean
  }
}

export = Option
