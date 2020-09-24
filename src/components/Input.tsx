import React, { useEffect, useRef } from 'react'

import { useField } from '@unform/core'

const Input = ( { name, ...rest }: Input.Props ) => {
  const inputRef = useRef( null )
  const { fieldName, defaultValue, registerField } = useField( name )

  useEffect( () => {
    registerField( {
      name: fieldName,
      ref: inputRef.current,
      path: 'value',
    } )
  }, [ fieldName, registerField ] )

  return <input ref={inputRef} defaultValue={defaultValue} {...rest} />
}

namespace Input {
  type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
  export interface Props extends InputProps {
    name: string
  }
}

export = Input
