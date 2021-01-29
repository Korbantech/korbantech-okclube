import React, { useEffect, useRef } from 'react'

import { useField } from '@unform/core'

const Input = ( { name, defaultValue: defaultValueProp, ...rest }: Input.Props ) => {
  const inputRef = useRef<HTMLInputElement>( null )
  const { fieldName, defaultValue, registerField } = useField( name )

  useEffect( () => {
    registerField( {
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    } )
  }, [ fieldName, registerField ] )

  useEffect( () => {
    if ( inputRef.current && defaultValueProp ) inputRef.current.value = defaultValueProp.toString()
  }, [ defaultValueProp ] )

  return <input ref={inputRef} defaultValue={defaultValue} {...rest} />
}

namespace Input {
  type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  export interface Props extends InputProps {
    name: string
  }
}

export = Input
