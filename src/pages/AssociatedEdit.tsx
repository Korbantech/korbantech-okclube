import React, { useEffect, useCallback, useRef, useState, createContext, useContext } from 'react'
import { FaMinusCircle, FaImage } from 'react-icons/fa'
import { useHistory, useParams } from 'react-router-dom'

import api from '@app/api'
import Input from '@components/Input'
import Loading from '@components/Loading'
import Select from '@components/Select'
import TextArea from '@components/TextArea'
import useRequest from '@hooks/useRequest'
import { useField } from '@unform/core'
import { Form } from '@unform/web'
import styled from 'styled-components'

const AssociatedEditContext = createContext( {} as any )

const AssociatedEdit = () => {  
  const history = useHistory()
  const categoriesRequest = useRequest<any[]>( '/associates/categories' )
  const [ currentImg, setCurrentImg ] = useState<null | string | ArrayBuffer>( null )
  const [ , setImgErrorMessage ] = useState<null | string>( null )
  const [ associated, setAssociated ] = useState<any>( null )
  const params = useParams<any>()

  useEffect( () => {
    if ( associated?.logo ) setCurrentImg( associated?.logo )
  }, [ associated ] )

  useEffect( () => {
    api.get( `/associates/${params.associated}` )
      .then( response => setAssociated( response.data ) )
      .catch( console.error )
  }, [ params.associated ] )

  useEffect( () => {
    if ( !categoriesRequest.init ) categoriesRequest.send()
  }, [ categoriesRequest ] )

  const onSubmit = useCallback( ( data: any ) => {
    data.logo = currentImg
    api.patch( `/associates/${params.associated}`, data )
      .then( () => history.goBack() )
      .catch( console.error )
  }, [ history, currentImg, params.associated ] )

  const onImageChange = useCallback( ( event: React.ChangeEvent<HTMLInputElement> ) => {
    setImgErrorMessage( null )
    const file = event.currentTarget.files?.item( 0 )
    if ( !file ) return setCurrentImg( null )
    if ( file.size > 1e+7 ) setImgErrorMessage( 'arquivo muito grande' )
    const reader = new FileReader()
    reader.onload = ( event ) => setCurrentImg( event.target?.result ?? null )
    reader.readAsDataURL( file )
  }, [] )

  if ( ( true ) as boolean )
    return (
      <Container>
        <CustomForm onSubmit={onSubmit}>
          { associated && 
            <>
              <div className='columns'>
                <div className='column is-9'>
                  <div className="field">
                    <label className="label">Nome</label>
                    <div className="control">
                      <Input className="input" name='name' defaultValue={associated.name}
                        type="text" placeholder="Nome do associado" />
                    </div>
                  </div>
                </div>
                <div className='column is-3'>
                  <div className="field">
                    <label className="label">Categoria</label>
                    <div className="control">
                      <div className="select" style={ { width: '100%' } }>
                        { categoriesRequest.data && associated
                          ? 
                          <Select name='benefit_category'
                            style={ { width: '100%' } }
                            defaultValue={ ( () => {
                              return categoriesRequest.data?.find(
                                category => category.name === associated.benefit_category
                              )?.id
                            } )() }>
                            {categoriesRequest.data?.map( category => 
                              <option value={category.id}>{category.name}</option>
                            )}
                          </Select>
                        
                          : <Loading size={20} /> }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="columns">
                <div className="column is-9">
                  <div className="field">
                    <label className="label">Regulamento</label>
                    <div className="control">
                      <TextArea name='description' defaultValue={associated.description}
                        className="textarea" placeholder="Descrição" />
                    </div>
                  </div>
                </div>
                <div className="column is-3">
                  <div className="field" style={ { height: '100%' } }>
                    <label className="label">Logo</label>
                    <div className="control" style={ { height: '80%' } }>
                      <label style={ {
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        border: '2px dashed #707070',
                      } }>
                        {currentImg
                          ? <img src={currentImg.toString()} />
                          : <div style={ {
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                          } }>
                            <FaImage size={30}/>
                            <p>Escolher imagem...</p>
                          </div> }
                        <input type='file' style={ { display: 'none' } } onChange={onImageChange}/>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="columns">
                <div className="column is-9">
                  <div className="field">
                    <label className="label">Título do benefio</label>
                    <div className="control">
                      <Input className="input" name='benefit_title' defaultValue={associated.benefit_title}
                        type="text" placeholder="Título do benefio" />
                    </div>
                  </div>
                </div>
                <div className="column is-3">
                  <div className="field">
                    <label className="label">Desconto</label>
                    <div className="control">
                      <Input className="input" name='benefit_discount' defaultValue={associated.benefit_discount}
                        type="number" placeholder="Desconto" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Descrição do beneficio</label>
                <div className="control">
                  <TextArea name='benefit_description' defaultValue={associated.benefit_description}
                    className="textarea" placeholder="Descrição do beneficio" />
                </div>
              </div>
              <AssociatedEditContext.Provider value={associated}>
                <ExtractContentComponent />
              </AssociatedEditContext.Provider>
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

const ExtractContentComponent = () => {
  const context = useContext( AssociatedEditContext )
  const [ addresses, setAddresses ] = useState<any[]>( context.address.map( ( address: any ) => ( { address } ) ) )
  const [ phones, setPhones ] = useState<any[]>( context.phones.map( ( phone: any ) => ( { phone } ) ) )

  const addPhone = useCallback( () => {
    setPhones( phones => phones.concat( { phone: '' } ) )
  }, [] )

  const addAddress = useCallback( () => {
    setAddresses( addresses => addresses.concat( { address: '' } ) )
  }, [] )

  return (
    <>
      {addresses.map( ( { address }, index ) => 
        <ExtractContentComponentFormStatic
          key={`addresses[${index}].address`}
          name={`addresses[${index}].address`}
          value={address}
        />
      )}
      {phones.map( ( { phone }, index ) => 
        <ExtractContentComponentFormStatic
          key={`phones[${index}].phone`}
          name={`phones[${index}].phone`}
          value={phone}
        />
      )}
      <div className='columns'>
        <div className='column is-9'>
          <label className="label">
            Endereços
          </label>
          {addresses.map( ( address, index ) => {
            const update = ( address: string ) => {
              setAddresses( addresses => addresses.map( ( data, i ) => {
                if ( index !== i ) return data
                return { address }
              } ) )
            }

            const remove = () => {
              setAddresses( addresses => addresses.filter( iaddress => iaddress !== address ) )
            }

            const change = ( event: any ) => update( event.currentTarget.value )

            return (
              <ExtraContentInput>
                <input className='input' style={ { width: '95%' } } value={address.address} onChange={change} />
                <FaMinusCircle onClick={ remove } />
              </ExtraContentInput>
            )
          } )}
          <AddNewContainer onClick={addAddress}>
            <AddNewSymbol>+</AddNewSymbol>
            novo endereço
          </AddNewContainer>
        </div>
        <div className='column is-3'>
          <label className="label">
            Telefones
          </label>
          {phones.map( ( phone, index ) => {
            const update = ( phone: string ) => {
              setPhones( phones => phones.map( ( data, i ) => {
                if ( index !== i ) return data
                return { phone }
              } ) )
            }

            const remove = () => {
              setPhones( phones => phones.filter( iphone => iphone !== phone ) )
            }

            const change = ( event: any ) => update( event.currentTarget.value )

            return (
              <ExtraContentInput>
                <input className='input' style={ { width: '95%' } } value={phone.phone} onChange={change} />
                <FaMinusCircle onClick={ remove } />
              </ExtraContentInput>
            )
          } )}
          <AddNewContainer onClick={addPhone}>
            <AddNewSymbol>+</AddNewSymbol>
            novo telefone
          </AddNewContainer>
        </div>
      </div>
    </>
  )
}

const AddNewContainer = styled.span`
  text-align: left;
  font: normal normal medium 16px/40px Roboto;
  letter-spacing: 0px;
  color: #001F87;
  opacity: 1;
`

const AddNewSymbol = styled.span`
  font-size: 20px;
  margin: 5px;
`

type ExtractContentComponentFormStaticProps = { name: string, value: any }

const ExtractContentComponentFormStatic = ( { name, value }: ExtractContentComponentFormStaticProps ) => {
  const ref = useRef( { value } )
  const { fieldName, registerField } = useField( name )

  useEffect( () => {
    registerField( {
      name: fieldName,
      ref: ref.current,
      path: 'value',
    } )
  }, [ fieldName, registerField ] )

  useEffect( () => {
    ref.current.value = value
  }, [ value ] ) 

  return null
}

const ExtraContentInput = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 0;
`

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

namespace AssociatedEdit {}

export = AssociatedEdit
