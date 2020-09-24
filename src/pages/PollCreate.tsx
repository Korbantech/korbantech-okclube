import React, { useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import api from '@app/api'
import Select from '@components/Select'
import TextArea from '@components/TextArea'
import useRequest from '@hooks/useRequest'
import { Form } from '@unform/web'
import styled from 'styled-components'

const PollCreate = () => {
  const programsRequest = useRequest<any[]>( '/programs' )
  const history = useHistory()

  useEffect( () => {
    if ( !programsRequest.init ) programsRequest.send()
  }, [ programsRequest ] )

  const onSubmit = useCallback( ( undata: any ) => {
    const data = Object.fromEntries(
      Object.entries( undata )
        .map( ( [ key, value ] ) => [ key, value === 'undefined' ? undefined : value ] )
    )
    api.post( '/polls', data )
      .then( () => history.goBack() )
      .catch( console.error )
  }, [ history ] )

  return (
    <Container>
      <CustomForm onSubmit={onSubmit}>
        <Label id='text'>
          Texto
          <CustomTextArea name='text' required/>
        </Label>
        <Label id='program'>
          Programa
          <CustomSelect name='program'>
            <option value={'undefined'}>Nenhum</option>
            {programsRequest.data?.map( program => 
              <option key={`program-option-${program.ID}`} value={program.ID}>{program.name}</option>
             )}
          </CustomSelect>
        </Label>
        <Label id='location'>
          Local
          <CustomSelect name='location'>
            <option value={'undefined'}>Nenhuma</option>
          </CustomSelect>
        </Label>
        <Button>Salvar</Button>
      </CustomForm>
    </Container>
  )
}

const Button = styled.button`
  grid-area: submit;
  outline: none;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 13px;
  text-align: center;
  color: rgba(255,255,255, 1);
  width: 100%;
  border: none;
  border-radius: 20px;
  background-color: rgba(16,89,255, 1);
  transition: all .5s ease, top .5s ease .5s, height .5s ease .5s, background-color .5s ease .75s;
  padding: 10px 0;
  :hover, :focus {
    cursor: pointer;
    background-color: #0F4FE6;
    transition: background-color .5s;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  grid-area: ${ props => props.id };
  p {
    margin: 0;
  }
`

const CustomForm = styled( Form )`
  background-color: white;
  display: grid;
  grid-template-areas: "text program" "text location" "text submit";
  box-shadow: 0 0 5px 0 #00000040;
  border-radius: 5px;
  padding: 10px 15px;
  grid-gap: 30px;
}`

const CustomTextArea = styled( TextArea )`
  grid-area: text;
  height: 100%;
  width: 35vw;
`

const CustomSelect = styled( Select )`
  grid-area: ${ props => props.name };
`

namespace PollCreate {}

export = PollCreate
