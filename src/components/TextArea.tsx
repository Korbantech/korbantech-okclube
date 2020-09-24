import React, { useEffect, useRef } from 'react'

import { useField } from '@unform/core'

const TextArea = ( { name, ...rest }: TextArea.Props ) => {
  const textareaRef = useRef( null )
  const { fieldName, defaultValue, registerField } = useField( name )

  useEffect( () => {
    registerField( {
      name: fieldName,
      ref: textareaRef.current,
      path: 'value',
    } )
  }, [ fieldName, registerField ] )

  return <textarea ref={textareaRef} defaultValue={defaultValue} {...rest} />
}

namespace TextArea {
  type TextAreaProps = React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
  export interface Props extends TextAreaProps {
    name: string
  }
}

export = TextArea
