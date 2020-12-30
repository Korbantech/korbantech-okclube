/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import connection from '@helpers/connection'
import fs from 'fs'
import { parse } from 'json2csv'
import path from 'path'
( async () => {
  // const [ tablesRow ] = await connection.raw( 'SHOW TABLES' )
  // const tables: string[] = tablesRow.map( ( table: any ) => table.Tables_in_api_nd_homolog )

  // const [ columns ] = await connection.raw( 'SHOW COLUMNS FROM associates' )

  let associates = await connection( 'associates' )
    .select( [
      'associates.id',
      'associates.name',
      'benefits.title AS beneficio',
      'benefits.discount AS discount',
      'benefits_categories.name AS category'
    ] )
    .leftJoin( 'benefits', 'benefits.id', 'associates.benefit' )
    .leftJoin( 'benefits_categories', 'benefits_categories.id', 'benefits.category' )

  await fs.promises.writeFile(
    path.join( __dirname, 'output.csv' ),
    parse( associates )
  )

  connection.destroy()
} )()
