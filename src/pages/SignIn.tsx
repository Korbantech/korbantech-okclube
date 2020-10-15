/* eslint-disable no-alert */
import React, { useCallback, ComponentType, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Redirect } from 'react-router-dom'

import api from '@app/api'
import Input from '@components/Input'
import useHasUser from '@hooks/useHasUser'
import logo from '@public/assets/grupo-nd.png'
import { Form } from '@unform/web'
import styled from 'styled-components'

import { userSignIn } from '../actions/userSign'

const SignIn = () => {
  const dispatch = useDispatch()
  const hasUser = useHasUser()
  const [ , setLoading ] = useState( false )

  const onSubmit = useCallback( ( data: any ) => {
    setLoading( true )
    api.post( '/admins/auth', data )
      .then( response => {
        localStorage.setItem( 'user-session', JSON.stringify( response.data ) )
        dispatch( userSignIn( response.data ) )
      } )
      .catch( () => { alert( 'usuário/senha inválidos' ) } )
      .finally( setLoading.bind( null, false ) )
  }, [ dispatch ] )

  if ( hasUser ) return <Redirect to='/' />

  return (
    <Container>
      <CustomForm onSubmit={onSubmit} style={ { maxWidth: '30%' } }>
        <img src={logo} style={ { maxWidth: '50%' } }/>
        <SignInInput name='email' label='Email' type='email' required/>
        <SignInInput name='password' label='Password' type='password' required/>
        <Button>Entrar</Button>
      </CustomForm>
    </Container>
  )
}

type CustomInputProps = typeof CustomInput extends ComponentType<infer P> ? P : never

const SignInInput = ( { label, ...props }: CustomInputProps & { label: string } ) => {
  return (
    <SignInInputContainer>
      <Label>{label}</Label>
      <CustomInput {...props}/>
    </SignInInputContainer>
  )
}

const SignInInputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 5px 0;
`

const Label = styled.label`
  margin: 0 5px 0 0;
  text-transform: uppercase;
  font-size: 13px;
  color: rgba(255,255,255,.7);
  margin: 2.5px 15px;
`

const CustomInput = styled( Input )`
  padding: 10px 15px;
  border: none;
  border-radius: 20px;
  margin-bottom: 20px;
  background: rgba(255,255,255,.2);
  outline: none;
  color: white;
  transition: background .5s ease;
  :focus {
    background: rgba(255,255,255,.3);
    border: none;
  }
`

const CustomForm = styled( Form )`
  background-color: white;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 30px;
  box-shadow: 0 0 10px 3px #00000040;
  background:
    linear-gradient( rgba( 35, 43, 85, 0.75 ), rgba( 35, 43, 85, 0.95 ) ),
    url( https://dl.dropboxusercontent.com/u/22006283/preview/codepen/clouds-cloudy-forest-mountain.jpg )
    no-repeat center center;
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eee;
`

const Button = styled.button`
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

namespace SignIn {}

export = SignIn
