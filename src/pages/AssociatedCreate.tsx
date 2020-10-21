import React, { useEffect, useCallback, useRef, useState, createContext, useContext } from 'react'
import { FaMinusCircle } from 'react-icons/fa'
import { useHistory } from 'react-router-dom'

import api from '@app/api'
import Input from '@components/Input'
import Select from '@components/Select'
import TextArea from '@components/TextArea'
import useRequest from '@hooks/useRequest'
import { useField } from '@unform/core'
import { Form } from '@unform/web'
import styled from 'styled-components'

const AssociatedCreateContext = createContext( {} as any )

const AssociatedCreate = () => {  
  const history = useHistory()
  const categoriesRequest = useRequest<any[]>( '/associates/categories' )
  const [ currentImg, setCurrentImg ] = useState<null | string | ArrayBuffer>( null )
  const [ , setImgErrorMessage ] = useState<null | string>( null )
  const [ associated ] = useState<any>( { address: [], phones: [] } )

  useEffect( () => {
    if ( associated?.logo ) setCurrentImg( associated?.logo )
  }, [ associated ] )

  useEffect( () => {
    if ( !categoriesRequest.init ) categoriesRequest.send()
  }, [ categoriesRequest ] )

  const onSubmit = useCallback( ( data: any ) => {
    data.logo = currentImg
    api.post( '/associates', data )
      .then( () => history.goBack() )
      .catch( console.error )
  }, [ history, currentImg ] )

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
                <div className='column'>
                  <div className="field">
                    <div className="file is-boxed">
                      <label className="file-label">
                        <input className="file-input" type="file" onChange={onImageChange}/>
                        <span className="file-cta" style={ { padding: '1em 0.5em' } }>
                          <span className="file-label">
                          Escolher logo…
                          </span>
                        </span>
                        <span className="file-name" style={ { padding: 0, height: 'auto', display: 'flex' } }>
                          {currentImg && <img src={currentImg?.toString()}/>}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className='column is-three-fifths'>
                  <div className="field">
                    <label className="label">Nome</label>
                    <div className="control">
                      <Input className="input" name='name' defaultValue={associated.name}
                        type="text" placeholder="Nome do associado" />
                    </div>
                  </div>
                </div>
                <div className='column'>
                  { categoriesRequest.data && associated && 
                  <div className="field">
                    <label className="label">Categoria</label>
                    <div className="control">
                      <div className="select">
                        <Select name='benefit_category' defaultValue={ ( () => {
                          return categoriesRequest.data?.find(
                            category => category.name === associated.benefit_category
                          )?.id
                        } )() }>
                          {categoriesRequest.data?.map( category => 
                            <option value={category.id}>{category.name}</option>
                          )}
                        </Select>
                      </div>
                    </div>
                  </div> }
                </div>
              </div>
              <div className="field">
                <label className="label">Regulamento</label>
                <div className="control">
                  <TextArea name='description' defaultValue={associated.description}
                    className="textarea" placeholder="Descrição" />
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label">Título do benefio</label>
                    <div className="control">
                      <Input className="input" name='benefit_title' defaultValue={associated.benefit_title}
                        type="text" placeholder="Título do benefio" />
                    </div>
                  </div>
                </div>
                <div className="column">
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
              <AssociatedCreateContext.Provider value={associated}>
                <ExtractContentComponent />
              </AssociatedCreateContext.Provider>
              <div className="field is-grouped">
                <div className="control">
                  <button className="button is-link">Salvar</button>
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
  const context = useContext( AssociatedCreateContext )
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
        <div className='column'>
          <label className="label">
            Endereços
            <span onClick={addAddress}> + </span>
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
                <input className='input' value={address.address} onChange={change} />
                <FaMinusCircle onClick={ remove } />
              </ExtraContentInput>
            )
          } )}
        </div>
        <div className='column'>
          <label className="label">
            Telefones
            <span onClick={addPhone}> + </span>
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
                <input className='input' value={phone.phone} onChange={change} />
                <FaMinusCircle onClick={ remove } />
              </ExtraContentInput>
            )
          } )}
        </div>
      </div>
    </>
  )
}

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

namespace AssociatedCreate {}

export = AssociatedCreate
