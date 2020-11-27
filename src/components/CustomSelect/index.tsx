import React, { PropsWithChildren } from 'react'
import { IoIosArrowDown } from 'react-icons/io'

import styled from 'styled-components'

import Option  from './Option'


class CustomSelect extends React.Component<CustomSelect.CustomSelectProps, CustomSelect.CustomSelectState>{

  static Option: typeof Option
  wrapperRef: React.RefObject<any>
  noSelectedText: string

  constructor( props:any ) {
    super( props )

    this.state = {
      open: false
    }

    this.noSelectedText = props.noSelectedText ?? 'Todos'
    this.wrapperRef = React.createRef<any>()
    this.toggleOpen = this.toggleOpen.bind( this )
    this.selectOption = this.selectOption.bind( this )
    this.handleClickOutside = this.handleClickOutside.bind( this )
    this.selectFirstOrSelectedAttr = this.selectFirstOrSelectedAttr.bind( this )
  }

  componentDidMount( ){
    document.addEventListener( 'mousedown', this.handleClickOutside )
    this.selectFirstOrSelectedAttr()
  }

  componentWillUnmount() {
    document.removeEventListener( 'mousedown', this.handleClickOutside )
  }

  handleClickOutside( event:any ){

    if (
      this.wrapperRef
      && this.wrapperRef.current
      && !this.wrapperRef.current.contains( event.target ) ) {
      this.setState( prevState => ( { ...prevState, open: false } ) )
    }
  }

  selectFirstOrSelectedAttr(){
    if( this.state.selected ) return

    let selected:any = null
    React.Children.map( this.props.children, child => {
      const current:React.ReactElement<Option.Props> = React.cloneElement( child as React.ReactElement<Option.Props> )
      if(  !selected && !this.state.selected  || current.props.selected ) {
        selected = current
        this.selectOption( current )
      }
      return child
    } )
  }

  componentDidUpdate(){
    this.selectFirstOrSelectedAttr()
  }

  selectOption( option: React.ReactElement<Option.Props> ):void{
    this.setState( prevState => (
      {
        ...prevState,
        open: false,
        selected: option
      }
    ) )
    this.props.onSelect && this.props.onSelect( option.props.value )
  }

  toggleOpen() {
    this.setState( prevState => ( { ...prevState, open: !this.state.open } ) )
  }

  render() {
    return(
      <Container ref={this.wrapperRef}  >
        { this.props.label && <Label> { this.props.label } </Label> }
        <Wrapper open={ this.state.open } >
          <Selected onClick={ this.toggleOpen } >
            { this.state.selected?.props.children }
            <ArrowIcon>
              <IoIosArrowDown color="#001F87" size={ 20 }/>
            </ArrowIcon>
          </Selected>

          <OptionsList>
            { this.props.children && React.Children.map( this.props.children, child =>
              React.cloneElement( child as React.ReactElement<Option.Props>, {
                handleOptionClick: this.selectOption
              } )
            ) }
          </OptionsList>
        </Wrapper>
      </Container>
    )
  }
}

type ContainerProps = {
  open: boolean,
}

const ArrowIcon = styled.div`
  display: inline-flex;
  transition: all 300ms;
`

const Selected = styled.div`
  height: 100%;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1E1E1E;
  text-transform: capitalize;
  font-family: 'Roboto', sans-serif;
`

const OptionsList = styled.div`
  display: flex;
  position: absolute;
  min-width: 100%;
  top: calc( 100% - 3px );
  left: 0;
  z-index: 99;
  background-color: white;
  overflow: auto;
  display: flex;
  flex-direction: column;
  border-radius: 0 0 4px 4px;
  border-top: none;
`

const Label = styled.div`
  font-weight: 16px;
  color: #1E1E1E;
  font-family: 'Roboto', sans-serif;
`

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin: 10px;
`

const Wrapper = styled.div<ContainerProps>`
  height: 100vh;
  position: relative;
  max-height: 40px;
  box-shadow: 0 0 0 1px #707070;
  border-radius: 4px;
  padding: 5px 10px;
  overflow: 'visible' ;
  min-width: 150px;

  ${ OptionsList } {
    height: fit-content;
    transition: max-height 300ms;
    width: max-content;
    min-width: 100%;
    max-height: ${ props => props.open ? '500px' : '0' };
    box-shadow: ${ props => props.open ? '0 1px 0 1px #707070' : 'none' };
  }

  ${ Selected }{
    ${ ArrowIcon }{
      margin-left: auto;
      transition: all 300ms;
      transform: rotate( ${ props => props.open ? '180deg' : '0deg' } );
    }
  }

`


namespace CustomSelect {

  export interface CustomSelectState{
    open: boolean,
    selected?: React.ReactElement<Option.Props>
  }
  export interface CustomSelectProps extends PropsWithChildren<{}>{
    // options: Option[],
    onSelect?: ( value: any ) => void,
    maxWidth?: number
    height?: number,
    label?: string
  }
}

CustomSelect.Option = Option

export = CustomSelect
