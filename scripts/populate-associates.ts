import cliProgress from 'cli-progress'

import clubeNd from '../data/export-clube-nd.json'
import connection from '../src/helpers/connection'
( async () => {

  console.log( 'populate associates' )

  const progress = new cliProgress.SingleBar( {}, cliProgress.Presets.legacy )

  progress.start( clubeNd.length, 0 )

  const benefitsCategories: { [key: string]: { id: number } } = {}

  const associates = await connection( 'associates' )
    .select( 'club_nd_id' )

  const ids = associates
    .map( associated => associated?.club_nd_id )
    .filter( Boolean ) as number[]

  for ( let associatedInfo of clubeNd ) {

    progress.increment()

    if ( ids.includes( associatedInfo.id ) ) {

      console.log(
        `associated already exists ( ${associatedInfo.nome_parceiro}:${associatedInfo.id} )`
      )

      continue

    }

    const categoryName = associatedInfo.categoria_beneficio.trim()

    if ( !benefitsCategories[categoryName] )
      benefitsCategories[categoryName] = await connection( 'benefits_categories' )
        .select( 'id' )
        .where( 'name', categoryName )
        .first()

    if ( !benefitsCategories[categoryName] )
      benefitsCategories[categoryName] = {
        id: ( await connection( 'benefits_categories' )
          .insert( { name: associatedInfo.categoria_beneficio.trim() } ) )
          .pop()
      }

    if ( !benefitsCategories[categoryName]?.id ) throw new Error( '' )

    const benefit = ( await connection( 'benefits' )
      .insert( {
        title: associatedInfo.titulo_beneficio,
        discount: associatedInfo.desconto_beneficio,
        description: associatedInfo.descricao_beneficio,
        category: benefitsCategories[categoryName].id
      } ) ).pop()

    if ( !benefit ) throw new Error( 'no benefit inserted' )

    const associated = ( await connection( 'associates' )
      .insert( {
        name: associatedInfo.nome_parceiro,
        logo: associatedInfo.logo_parceiro,
        description: associatedInfo.descricao_parceiro,
        club_nd_id: associatedInfo.id,
        benefit
      } ) ).pop()

    if ( !associated ) throw new Error( 'no associated insert' )

    for ( let address of associatedInfo.endereco_parceiro ) {
      void await connection( 'associates_addresses' ).insert( { address, associated } )
    }

    for ( let phone of associatedInfo.telefone_parceiro ) {
      void await connection( 'associates_phones' ).insert( { phone, associated } )
    }

  }

  progress.stop()

  connection.destroy()
} )()
