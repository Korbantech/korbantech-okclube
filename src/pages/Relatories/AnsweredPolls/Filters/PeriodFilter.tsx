import React, { useCallback, useEffect, useMemo, useState } from 'react'

import CustomSelect from '@components/CustomSelect'
import { MONTHS, MONTHS_SHORT } from '@constants/index'

import { FilterProps } from '.'

const PeriodFilter = ( { periodType, ...props }:Props )  => {

  const [ itens, setItens ] = useState<PeriodFilterType[]>( [] )
  const period = useMemo<number>( () => 1, [] )

  const loadMonths = useCallback( ( ) => {
    const date = new Date()
    date.setFullYear( date.getFullYear() - period )

    let itens:PeriodFilterType[] = []

    const loop = () => {
      while( date.getTime() <= new Date().getTime() ){

        const label:string = `${ MONTHS[date.getMonth()] } / ${date.getFullYear()}`

        const from:Date = new Date( date.getFullYear(), date.getMonth(), 1 )
        const to:Date = new Date( date.getFullYear(), date.getMonth() + 1, 0 )

        const period:any = {
          from: `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}`,
          to: `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`
        }

        const obj:PeriodFilterType = {
          label,
          period
        }
        date.setMonth( date.getMonth() + 1 )
        itens.push( obj )
      }
    }

    loop()

    setItens( itens )
  }, [ period ] )

  const loadWeeks = useCallback( (  ) => {
    const date = new Date()
    date.setFullYear( date.getFullYear() - period )
    date.setDate( date.getDate() - date.getDay()  )

    let itens:PeriodFilterType[] = []

    const loop = () => {
      while( date.getTime() <= new Date().getTime() ){

        const from:Date = new Date( date.getFullYear(), date.getMonth(), date.getDate()  )
        const to:Date = new Date( date.getFullYear(), date.getMonth(), date.getDate() + 6 )

        const label:string =
          `${ from.getDate() }/${ MONTHS_SHORT[from.getMonth()] } as `
          + `${ to.getDate() }/${ MONTHS_SHORT[to.getMonth()] }`
          + ` de ${date.getFullYear()}`

        const period:any = {
          from: `${from.getFullYear()}-${from.getMonth() + 1}-${from.getDate()}`,
          to: `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`
        }

        const obj:PeriodFilterType = {
          label,
          period
        }
        date.setDate( date.getDate() + 7 )
        itens.push( obj )
      }
    }

    loop()

    setItens( itens )
  }, [ period ] )

  useEffect( () => {
    switch( periodType ){
      case 'week':
        loadWeeks( )
        break

      case 'month':
      default:
        loadMonths()
    }


  }, [ periodType, loadWeeks, loadMonths ] )


  return (
    <CustomSelect
      label={ periodType === 'week' ? 'Semana' : 'Mes' }
      onSelect={ props.onSelect }>
      <CustomSelect.Option value={ undefined } > Todos </CustomSelect.Option>
      { itens.map( ( iten:any ) =>
        <CustomSelect.Option
          key={ iten.label }
          value={ iten.period }
        >
          { iten.label }
        </CustomSelect.Option>
      ) }
    </CustomSelect>
  )
}


interface Props extends FilterProps{
  periodType?: string
}

export interface PeriodFilterType{
  label: string
  period: {
    from: string,
    to: string
  }
}

export { PeriodFilter }
