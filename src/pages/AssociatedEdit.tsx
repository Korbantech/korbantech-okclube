import React, { useEffect, useCallback, useRef, useState, createContext, useContext } from 'react'
import { FaPlus, FaMinusCircle } from 'react-icons/fa'
import { useHistory, useParams } from 'react-router-dom'

import api from '@app/api'
import Input from '@components/Input'
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
  const ref = useRef<HTMLInputElement>( null )
  const [ currentImg, setCurrentImg ] = useState<null | string | ArrayBuffer>( null )
  const [ imgErrorMessage, setImgErrorMessage ] = useState<null | string>( null )
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

  return (
    <Container>
      <CustomForm onSubmit={onSubmit}>
        { !!associated && 
          <div style={ { display: 'flex' } }>
            <div>
              <div style={ { display: 'flex', flexDirection: 'column', margin: '0 10px' } }>
                { currentImg && 
                  <img src={currentImg?.toString()} style={ { maxWidth: '200px' } }/>
                }
                { imgErrorMessage && <p>{imgErrorMessage}</p> }
                <input type="file" ref={ref} onChange={onImageChange} accept="image/png, image/jpeg"/>
              </div>
              <div style={ { display: 'flex', flex: 1 } }>
                <Label style={ { flex: 1 } }>
                Nome
                  <CustomInput name='name' defaultValue={associated.name} required/>
                </Label>
                <Label>
                Categoria
                  <CustomSelect name='benefit_category' defaultValue={ ( () => {
                    return categoriesRequest.data?.find(
                      category => category.name === associated.benefit_category
                    )?.id
                  } )() } required>
                    {categoriesRequest.data?.map( category => 
                      <option value={category.id}>{category.name}</option>
                    )}
                  </CustomSelect>
                </Label>
              </div>
              <Label>
              Descrição
                <CustomTextArea name='description' defaultValue={associated.description} required/>
              </Label>
              <div style={ { display: 'flex' } }>
                <Label style={ { flex: 1 } }>
                  Título do beneficio
                  <CustomInput name='benefit_title' defaultValue={associated.benefit_title} required/>
                </Label>
                <Label>
                  Desconto
                  <CustomInput type='number' name='benefit_discount' defaultValue={associated.benefit_discount} required/>
                </Label>
              </div>
              <Label>
                Descrição do beneficio
                <CustomTextArea name='benefit_description' defaultValue={associated.benefit_description} required/>
              </Label>
              <Button>Salvar</Button>
            </div>
            <AssociatedEditContext.Provider value={associated}>
              <ExtractContentComponent />
            </AssociatedEditContext.Provider>
          </div>
        }
      </CustomForm>
    </Container>
  )
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
    <div style={ { width: '20vw', paddingLeft: 10, borderLeft: '1px solid #ddd' } }>
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
      <ExtraContent>
        <ExtraContentText>
          <CustomP>Endereços</CustomP>
          <FaPlus onClick={addAddress}/>
        </ExtraContentText>
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
          return (
            <div style={ { display: 'flex', justifyContent: 'space-between', margin: '10px 0 0', } }>
              <input style={ { width: '100%' } } value={address.address} onChange={ event => update( event.currentTarget.value ) } />
              <FaMinusCircle onClick={ remove } />
            </div>
          )
        } )}
      </ExtraContent>
      <ExtraContent>
        <ExtraContentText>
          <CustomP>Telefones</CustomP>
          <FaPlus onClick={addPhone}/>
        </ExtraContentText>
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

          return (
            <div style={ { display: 'flex', justifyContent: 'space-between', margin: '10px 0 0', } }>
              <input style={ { width: '100%' } } value={phone.phone}
                onChange={ event => update( event.currentTarget.value ) } />
              <FaMinusCircle onClick={ remove } />
            </div>
          )
        } )}
      </ExtraContent>
    </div>
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

const ExtraContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`

const ExtraContentText = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`

const CustomP = styled.p`
  margin: 0 10px 0 0;
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
  padding: 5px 10px;
  width: auto;
  margin: 10px auto;
  display: flex;
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
  padding: 0 10px;
  margin: 10px 0;
  p {
    margin: 0;
  }
`

const CustomForm = styled( Form )`
  background-color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 5px 0 #00000040;
  border-radius: 5px;
  padding: 10px 15px;
  grid-gap: 30px;
`

const CustomInput = styled( Input )``

const CustomTextArea = styled( TextArea )`
  grid-area: text;
  height: 100%;
  width: 35vw;
`

const CustomSelect = styled( Select )`
  grid-area: ${ props => props.name };
`

namespace AssociatedEdit {}

export = AssociatedEdit
