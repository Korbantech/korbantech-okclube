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
  const locationRequest = useRequest<any[]>( 'https://ndmais.com.br/wp-json/ndmais/v1/content/filters/location/' )
  
  const history = useHistory()

  useEffect( () => {
    if ( !programsRequest.init ) programsRequest.send()
    if ( !locationRequest.init ) locationRequest.send()
  }, [ programsRequest, locationRequest ] )

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
        <section className='section'>
          <div className='columns'>
            <div className='column'>
              <div className="field">
                <label className="label">Texto</label>
                <div className="control">
                  <TextArea name='text' className="textarea" placeholder="Texto" />
                </div>
              </div>
            </div>
            <div className='column'>
              <div className="field">
                <label className="label">Programa</label>
                <div className="control">
                  <div className="select">
                    <Select name='program'>
                      <option value={'undefined'}>Nenhum</option>
                      {programsRequest.data?.map( program => 
                        <option key={`program-option-${program.ID}`} value={program.ID}>
                          {program.name}
                        </option>
                    )}
                    </Select>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Localização</label>
                <div className="control">
                  <div className="select">
                    <Select name='location'>
                      {locationRequest.data?.map( location => 
                        <option key={`location-option-${location.slug}`} value={location.slug}>
                          {location.name}
                        </option>
                    )}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="field">
          <div className="control">
            <button className="button is-link">Salvar</button>
          </div>
        </div>
      </CustomForm>
    </Container>
  )
}

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
  grid-gap: 30px;
`

namespace PollCreate {}

export = PollCreate
