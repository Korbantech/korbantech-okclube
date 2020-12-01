import React from 'react'

import { PeriodFilter } from './PeriodFilter'
import { PeriodTypeFilter } from './PeriodTypeFilter'


const Filters = ( { ...props }:Props ) => {

  return (
    <>

      <PeriodTypeFilter
        onSelect={ props.onChangePeriodType }
      />

      <PeriodFilter
        periodType={ props.periodType }
        onSelect={ props.onChangePeriod }
      />

    </>
  )
}


interface Props {
  onChangePeriodType?: ( v:any ) => void
  onChangePeriod?: ( v:any ) => void
  periodType?: string
}


export type FilterProps = {
  onSelect?: ( value:any ) => void
}

export { Filters }
