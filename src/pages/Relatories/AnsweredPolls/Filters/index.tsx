import React from 'react'
import { PeriodFilter } from './PeriodFilter'
import { PeriodTypeFilter } from './PeriodTypeFilter'
import { ProgramFilter } from './ProgramsFilter'
import { RegionFilter } from './RegionFilter'


const Filters = ( { ...props }:Props ) => {

  return (
    <>
      <ProgramFilter
        programs={ props.programs }
        onSelect={ props.onChangeProgram }
      />

      <RegionFilter
        regions={ props.regions }
        onSelect={ props.onChangeRegion }
      />

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
  programs: any[]
  regions: any[]
  onChangePeriodType?: ( v:any ) => void
  onChangeProgram?: ( v:any ) => void
  onChangePeriod?: ( v:any ) => void
  onChangeRegion?: ( v:any ) => void
  periodType?: string
}


export type FilterProps = {
  onSelect?: ( value:any ) => void
}

export { Filters }
