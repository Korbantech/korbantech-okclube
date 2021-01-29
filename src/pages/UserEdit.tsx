import React, { useEffect, useCallback, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import api from '@app/api'
import Input from '@components/Input'
import Loading  from '@components/Loading'
import useRequest from '@hooks/useRequest'
import { Form } from '@unform/web'
import { validate } from 'gerador-validador-cpf'
import styled from 'styled-components'

/**
address: null
birthday: null
code: "335417"
contract: null
created_at: "2021-01-20T04:56:59.000Z"
document: "00392556979"
facebook: null
id: 509
instagram: null
mail: "pulgadabarra2@hotmail.com"
name: "EMERSON CUNHA"
partnerships_network_id: null
pass: "Barradalagoa"
photo: "http://dashboard.app.ndmais.com.br/public/users/images/509-photo.jpg?at=1611107819774"
tel: null
twitter: null
type: null
updated_at: "2021-01-20T04:56:59.000Z"
user: 509
valid: "2021-09-09T19:02:23.000Z"
zip_code: null
 */

const UserEdit = () => {  
  const history = useHistory()
  const categoriesRequest = useRequest<any[]>( '/associates/categories' )
  const [ currentImg, setCurrentImg ] = useState<null | string | ArrayBuffer>( null )
  const [ user, setUser ] = useState<any>( null )
  const params = useParams<any>()
  const [ manualEdit ] = useState( false )
  const [ document, setDocument ] = useState( '' )
  const [ loading, setLoading ] = useState( false )

  useEffect( () => {
    if ( user ) setDocument( user.document )
  }, [ user ] )

  useEffect( () => {
    if ( user?.logo ) setCurrentImg( user?.logo )
  }, [ user ] )

  useEffect( () => {
    setLoading( true )
    api.get( `/users/${params.user}` )
      .then( response => setUser( response.data ) )
      .catch( console.error )
      .finally( setLoading.bind( null, false ) )
  }, [ params.user ] )

  const onUpdate = useCallback( () => {
    if ( !user ) return void 0
    setLoading( true )
    api.get( `/check/${user.id}` )
      .then( response => setUser( response.data ) )
      .catch( console.error )
      .finally( setLoading.bind( null, false ) )
  }, [ user ] )

  useEffect( () => {
    if ( !categoriesRequest.init ) categoriesRequest.send()
  }, [ categoriesRequest ] )

  const onSubmit = useCallback( ( data: any ) => {
    data.logo = currentImg
    api.patch( `/users/${params.user}`, data )
      .then( () => history.goBack() )
      .catch( console.error )
  }, [ history, currentImg, params.user ] )

  if ( ( true ) as boolean )
    return (
      <Container>
        <CustomForm onSubmit={onSubmit}>
          { user && 
            <>
              <section className="section" style={ { padding: 0 } }>
                <div className="container">
                  <div className="columns">
                    <div className="column is-5 is-flex is-flex-direction-row is-align-items-center">
                      <h2 className="title" style={ { marginBottom: 0, marginRight: 10 } }>
                        Dados do usuário
                        <br />
                        <small className="subtitle is-6">Ultima atualização em {new Date( user.updated_at ).toLocaleString()}</small>
                      </h2>
                      { loading && <Loading size={20}/> }
                    </div>
                    <div className="column is-5" />
                    <div className="column is-2">
                      <button className="button" style={ { marginLeft: 'auto', display: 'flex' } } onClick={onUpdate} disabled={loading}>Atualizar</button>
                    </div>
                  </div>
                  <div className='columns'>
                    <div className='column is-6'>
                      <div className="field">
                        <label className="label">Nome</label>
                        <div className="control">
                          <Input className="input" name='name' defaultValue={user.name}
                            type="text" placeholder="Nome do associado" />
                        </div>
                      </div>
                    </div>
                    <div className='column is-6'>
                      <div className="field">
                        <label className="label">Email</label>
                        <div className="control">
                          <Input className="input" name='mail' defaultValue={user.mail}
                            type="email" placeholder="Email do associado"/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='columns'>
                    <div className='column is-2'>
                      <div className="field">
                        <label className="label">Documento</label>
                        <div className="control">
                          <Input className="input" name='document' defaultValue={user.document}
                            type="text" placeholder="Documento do associado"
                            onChange={ event => setDocument( event.currentTarget.value ) }/>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='columns'>
                    <div className='column is-5'>
                      <div className="field">
                        <label className="label">Senha</label>
                        <div className="control">
                          <Input className="input" name='pass' type="text" placeholder="Senha do associado" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <UserDocumentPreview document={document} original={user.document}/>
              <section className="section" style={ { padding: 0 } }>
                <div className="container">
                  <h2 className="title">Dados de assinante</h2>
                  <h5 className="subtitle is-6">( Somente leitura )</h5>
                  <div className="columns">
                    <div className="column is-2">
                      <div className="field">
                        <label className="label">Código</label>
                        <div className="control">
                          <Input readOnly={!manualEdit} className="input" name='code' defaultValue={user.code}
                            type="text" placeholder="Código do associado" />
                        </div>
                      </div>
                    </div>
                    <div className="column is-4">
                      <div className="field">
                        <label className="label">Validade</label>
                        <div className="control">
                          <Input readOnly={!manualEdit} className="input" name='valid'
                            defaultValue={new Date( user.valid ).toISOString().slice( 0, 16 )}
                            type="datetime-local" placeholder="Validade da assinatura" />
                        </div>
                      </div>
                    </div>
                    <div className="column is-3">
                      <div className="field">
                        <label className="label">Contrato</label>
                        <div className="control">
                          <Input readOnly={!manualEdit} className="input" name='contract' defaultValue={user.contract}
                            type="text" placeholder="Contrato do associado" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="field is-grouped">
                <div className="control" style={ { marginLeft: 'auto' } }>
                  <button className="button is-link" style={ {
                    backgroundColor: '#001F87',
                    padding: '10px 40px'
                  } }>Salvar</button>
                </div>
              </div>
            </>
          }
        </CustomForm>
      </Container>
    )

  return null
}

const UserDocumentPreview = ( { document, original }: { document: string, original: string } ) => {
  const [ info, setInfo ] = useState<any[] | null>( null )
  const [ , setLoading ] = useState( false )

  useEffect( () => {
    if ( !validate( document ) ) return () => {}
    setLoading( true )
    api.get( `/users/external/${document}` )
      .then( response => setInfo( response.data ) )
      .catch( console.error )
      .finally( setLoading.bind( null, false ) )
    return () => setInfo( null )
  }, [ document ] )

  useEffect( () =>  {
    console.log( info )
  }, [ info ] )

  if ( info && document !== original ) return (
    <section className="section" style={ { padding: 0 } }>
      { info[0].codigoDaPessoaAssinante !== 0 ? 
        <>
          <div className="columns">
            <div className="column is-1">Beneficiario</div>
            <div className="column is-3">Nome</div>
            <div className="column is-4">Email</div>
            <div className="column is-1">Tipo</div>
            <div className="column is-3">Validade</div>
          </div>
          { info.map( ( people, index ) => 
            <div className="columns" key={`preview-people-${index}`}>
              <div className="column is-1">{!people.nomeDoBeneficario ? 'Sim' : 'Não'}</div>
              <div className="column is-3">{people.nomeDoAssinante}</div>
              <div className="column is-4">{people.email}</div>
              <div className="column is-1">{people.tipo}</div>
              <div className="column is-3">{people.dataDeValidade}</div>
            </div>
          ) }
        </>
        : 
        <h4 className="title is-5">
          O CPF não é assinante
        </h4>
      }
    </section>
  )

  return null
}

const Container = styled.div`
  height: 100vh;
`

const CustomForm = styled( Form )`
  background-color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 5px 0 #00000040;
  border-radius: 5px;
  padding: 10px 15px;
  grid-gap: 30px;
  height: 75%;
  overflow-y: scroll;
  margin-top: 5.5%;
`

namespace UserEdit {}

export = UserEdit
