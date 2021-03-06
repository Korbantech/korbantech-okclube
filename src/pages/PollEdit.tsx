import React, { useEffect, useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'

import api from '@app/api'
import Select from '@components/Select'
import TextArea from '@components/TextArea'
import useRequest from '@hooks/useRequest'
import { Form } from '@unform/web'
import styled from 'styled-components'

const PollEdit = () => {
  const programsRequest = useRequest<any[]>( '/programs' )
  const locationRequest = useRequest<any[]>( 'https://ndmais.com.br/wp-json/ndmais/v1/content/filters/location/' )

  const history = useHistory()

  const params = useParams<any>()

  const [ poll, setPoll ] = useState<any>( null )

  useEffect( () => {
    api.get( `/polls/${params.poll}/details` )
      .then( response => setPoll( response.data ) )
  }, [ params.poll ] )

  useEffect( () => {
    if ( !programsRequest.init ) programsRequest.send()
    if ( !locationRequest.init ) locationRequest.send()
  }, [ programsRequest, locationRequest ] )

  const onSubmit = useCallback( ( undata: any ) => {
    const data = Object.fromEntries(
      Object.entries( undata )
        .map( ( [ key, value ] ) => [ key, value === 'undefined' ? undefined : value ] )
    )
    api.put( `/polls/${params.poll}`, data )
      .then( () => history.goBack() )
      .catch( console.error )
  }, [ history, params.poll ] )

  return (
    <Container>
      <CustomForm onSubmit={onSubmit}>
        { poll && 
            <>
              <div className='columns'>
                <div className='column'>
                  <div className="field">
                    <label className="label">Texto</label>
                    <div className="control">
                      <TextArea className="textarea" name='text' defaultValue={poll.text} placeholder="Texto" />
                    </div>
                  </div>
                </div>
              </div>
              <div className='columns'>
                <div className='column is-5'>
                  <div className="field">
                    <label className="label">Programa</label>
                    <div className="control">
                      <div className="select">
                        { programsRequest.data
                          ? 
                          <Select name='program' defaultValue={ poll.program }>
                            <option value={'undefined'}>Nenhum</option>
                            {programsRequest.data.map( program => 
                              <option key={`program-option-${program.ID}`} value={program.ID}>{program.name}</option>
                            )}
                          </Select>
                          : null }
                      </div>
                    </div>
                  </div>
                </div>
                <div className='column is-5' >
                  <div className="field">
                    <label className="label">Local</label>
                    <div className="control">
                      <div className="select">
                        { locationRequest.data
                          ? 
                          <Select name='location' defaultValue={ poll.location }>
                            <option value={'undefined'}>Nenhum</option>
                            {locationRequest.data?.map( location => 
                              <option key={`location-option-${location.slug}`} value={location.slug}>
                                {location.name}
                              </option>
                            )}
                          </Select>
                          : null }
                      </div>
                    </div>
                  </div>
                </div>
                <div className='column is-2'
                  style={ { display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                  <Button>Salvar</Button>
                </div>
              </div>
            </>
        }
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

const CustomForm = styled( Form )`
  background-color: white;
  box-shadow: 0 0 5px 0 #00000040;
  border-radius: 5px;
  padding: 10px 15px;
`

namespace PollEdit {}

export = PollEdit
