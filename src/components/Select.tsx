import React, { useEffect, useRef } from 'react'

import { useField } from '@unform/core'

const Select = ( { name, ...rest }: Select.Props ) => {
  const selectRef = useRef( null )
  const { fieldName, defaultValue, registerField } = useField( name )

  useEffect( () => {
    registerField( {
      name: fieldName,
      ref: selectRef.current,
      path: 'value',
    } )
  }, [ fieldName, registerField ] )

  console.log( 'select' )

  return <select ref={selectRef} defaultValue={defaultValue} {...rest} />
}

namespace Select {
  export interface Props extends
    React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
    name: string
  }
}

export = Select
