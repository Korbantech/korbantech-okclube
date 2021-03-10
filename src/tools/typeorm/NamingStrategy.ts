import humps from 'humps'
import pluralize from 'pluralize'
import { NamingStrategyInterface, DefaultNamingStrategy } from 'typeorm'

pluralize.addUncountableRule( 'to' )
pluralize.addUncountableRule( 'for' )

const cache: { [k: string]: string } = {}

const parse = ( str: string, from: 'pascal' | 'camel', toPlural = false ) => {
  if ( cache[`${str}${from}${toPlural}`] ) return cache[`${str}${from}${toPlural}`]
  let nstr = humps[`de${from}ize` as const]( str, { separator: '_' } )
  if ( toPlural ) nstr = nstr.split( '_' ).map( word => toPlural ? pluralize( word ) : word ).join( '_' )
  return cache[`${str}${from}${toPlural}`] = nstr
}

export class NamingStrategySnakeCase extends DefaultNamingStrategy implements NamingStrategyInterface {
  public tableName = ( name: string, defined?: string ) =>
    defined ?? parse( name, 'pascal', true )

  public columnName = (
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[]
  ) => {
    const output = super.columnName( propertyName, customName, embeddedPrefixes )
    return parse( output, 'camel' )
  }

  public relationName = ( propertyName: string ) => parse( propertyName, 'camel' )
  public closureJunctionTableName = ( originalClosureTableName: string ) => parse( originalClosureTableName, 'camel' )

  public joinColumnName = ( relationName: string, referencedColumnName: string ) => {
    const output = super.joinColumnName( parse( relationName, 'camel' ), parse( referencedColumnName, 'camel' ) )
    return parse( output, 'camel' )
  }

  public joinTableName = (
    firstTableName: string,
    secondTableName: string
  ) => {
    return `${firstTableName}_${secondTableName}`
  }

  public joinTableColumnName = ( tableName: string, propertyName: string, columnName?: string ) => {
    const output = super.joinTableColumnName(
      pluralize.singular( tableName ),
      propertyName,
      columnName
    )
    return parse( output, 'camel' )
  }
}
