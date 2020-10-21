import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'

import styled from 'styled-components'

import InputWithDelay from './InputWithDelay'

const ScreenHeaderWithSearch = ( {
  title,
  rightButtonTo,
  rightButtonText,
  onSearchChange,
  searchInputPlaceholder,
}: ScreenHeaderWithSearch.Props ) => {

  const onChange = useCallback( ( event: InputWithDelay.ChangeEvent ) => {
    onSearchChange?.( event.target.value )
  }, [ onSearchChange ] )

  return (
    <div className="columns is-align-items-center" style={ { margin: 0 } }>
      <div className="column is-5">
        <Title>{title}</Title>
      </div>
      <div className="column is-4">
        <Search onChange={onChange} placeholder={searchInputPlaceholder}/>
      </div>
      <div className="column">
        <ButtonLink to={rightButtonTo}>
          {rightButtonText}
        </ButtonLink>
      </div>
    </div>
  )
}


const Title = styled.h2`
  text-align: left;
  font: normal normal bold 32px/40px Roboto;
  letter-spacing: 0px;
  color: #1E1E1E;
  opacity: 1;
`

const Search = styled( InputWithDelay )`
  background: #FFFFFF 0% 0% no-repeat padding-box;
  border: 1px solid #707070;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
`

const ButtonLink = styled( Link )`
  background-color: #001F87;
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
`

namespace ScreenHeaderWithSearch {
  export interface Props {
    title: string
    rightButtonTo: string
    rightButtonText: string
    onSearchChange: ( search: string ) => void
    searchInputPlaceholder?: string
  }
}

export = ScreenHeaderWithSearch
