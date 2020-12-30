import React from 'react'

import CustomSelect from '@components/CustomSelect'

import { FilterProps } from '.'

const RegionFilter = ( { onSelect, regions }:Props ) => {

  return (
    <CustomSelect
      label="Região"
      onSelect={ onSelect } >
      <CustomSelect.Option value={ undefined } > Todos </CustomSelect.Option>
      { regions.map(  ( region:any ) => {
        return <CustomSelect.Option value={ region.slug } > { region.name } </CustomSelect.Option>
      } ) }
    </CustomSelect>
  )
}

interface Props extends FilterProps {
  regions: any[],
}
export { RegionFilter }
