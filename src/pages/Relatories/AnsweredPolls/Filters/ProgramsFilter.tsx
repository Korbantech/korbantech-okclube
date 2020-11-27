import React from 'react'

import CustomSelect from '@components/CustomSelect'
import { FilterProps } from '.'

const ProgramFilter = ( { onSelect, programs }:Props ) => {

  return (
    <CustomSelect
      label="Programa"
      onSelect={ onSelect } >
      <CustomSelect.Option value={ undefined } > Todos </CustomSelect.Option>
      { programs.map(  ( program:any ) => {
        return <CustomSelect.Option value={ program.ID } > { program.name } </CustomSelect.Option>
      } ) }
    </CustomSelect>
  )
}

interface Props extends FilterProps{
  programs: any[],
}
export { ProgramFilter }
