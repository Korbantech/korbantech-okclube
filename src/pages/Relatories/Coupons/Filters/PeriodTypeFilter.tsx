import React from 'react'

import CustomSelect from '@components/CustomSelect'

import { FilterProps } from '.'

const PeriodTypeFilter = ( { onSelect }:Props ) => {

  return (
    <CustomSelect
      label="Período"
      onSelect={ onSelect } >
      {
        [
          {
            name: 'Mensal',
            value: 'month'
          },
          {
            name: 'Semanal',
            value: 'week'
          },
        ].map( period => {
          return <CustomSelect.Option value={ period.value } > { period.name } </CustomSelect.Option>
        }
        )
      }
    </CustomSelect>
  )
}

interface Props extends FilterProps{ }


export { PeriodTypeFilter }
