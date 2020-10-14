import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'

import api from '@app/api'
import Input from '@components/Input'
import TextArea from '@components/TextArea'
import { Form } from '@unform/web'
import styled from 'styled-components'

const NotificationCreate = () => {
  const history = useHistory()

  const onSubmit = useCallback( ( data: any ) => {
    api.post( '/notifications', data )
      .then( () => history.goBack() )
      .catch( console.error )
  }, [ history ] )

  return (
    <Container>
      <CustomForm onSubmit={onSubmit}>
        <section className='section'>
          <div className="field">
            <label className="label">Título</label>
            <div className="control">
              <Input name='title' className="input" placeholder="Título" />
            </div>
          </div>
          <div className="field">
            <label className="label">Mensagem</label>
            <div className="control">
              <TextArea name='body' className="textarea" placeholder="Mensagem" />
            </div>
          </div>
        </section>
        <div className="field">
          <div className="control">
            <button className="button is-link">Enviar</button>
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

namespace NotificationCreate {}

export = NotificationCreate
