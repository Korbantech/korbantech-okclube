/* eslint-disable array-element-newline */
/* eslint-disable array-bracket-newline */
import connection from '@helpers/connection'
import { Router } from 'express'
import fs from 'fs'

const associates = Router()

associates.route( '/associates' )
  .get( ( req, res, next ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null
    const categories = req.query?.categories?.toString().split( ',' ) ?? []
    const favorite: string | null = req.query?.favorite?.toString() || null
    const user: string | null = req.query?.user?.toString() || null
  
    const query = connection( 'associates' )
      .select(
        'associates.*',
        'benefits.title AS benefit_title',
        'benefits_categories.name AS benefit_category',
        'benefits.discount AS benefit_discount',
        'benefits.description AS benefit_description',
        connection.raw( 'GROUP_CONCAT( DISTINCT associates_addresses.address SEPARATOR \'|\' ) AS address' ),
        connection.raw( 'GROUP_CONCAT( DISTINCT associates_phones.phone SEPARATOR \'|\' ) AS phones' ),
      )
      .limit( limit )
      .leftJoin( 'associates_addresses', 'associates_addresses.associated', 'associates.id' )
      .leftJoin( 'associates_phones', 'associates_phones.associated', 'associates.id' )
      .join( 'benefits', 'benefits.id', 'associates.id' )
      .join( 'benefits_categories', 'benefits.category', 'benefits_categories.id' )
      .offset( page * limit )
      .orderBy( order, orderType )
      .groupBy( 'associates.id' )
  
    if ( favorite )
      query.join( 'favorite_associates', 'favorite_associates.associated', 'associates.id' )
        .where( 'favorite_associates.user', '=', user || favorite )
  
    if ( user && !favorite )
      query
        .leftJoin( 'favorite_associates', clause => {
          // @ts-ignore
          clause.on( 'favorite_associates.user', '=', parseInt( user, 10 ) )
            .andOn( 'favorite_associates.associated', '=', 'associates.id' )
        } )
        .column( connection.raw( 'CASE WHEN favorite_associates.user IS NULL THEN 0 ELSE 1 END AS favorite' ) )
  
    if ( !excluded ) query.whereNull( 'deleted_at' )
  
    if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )
  
    if ( like ) query.where( 'associates.name', 'like', `%${like}%` )
  
    if ( categories.length ) query.whereIn( 'benefits_categories.id', categories )

    query
      .then( rows => rows.map( row => ( {
        ...row,
        address: row.address?.split( '|' ) || [],
        phones: row.phones?.split( '|' ) || [],
        discount: row.benefit_discount,
        category: row.benefit_category,
        favorite: row.favorite !== undefined ? Boolean( row.favorite ) : undefined
      } ) ) )
      .then( res.json.bind( res ) )
      .catch( next )
  } )
  .post( ( req, res, next ) => {
    const associated = {
      name: req.body.name,
      description: req.body.description,
    }

    const benefit = {
      title: req.body.benefit_title,
      discount: req.body.benefit_discount,
      description: req.body.benefit_description,
      category: req.body.benefit_category,
    }

    const addresses: any[] = req.body.addresses

    const phones: any[] = req.body.phones

    let associatedId: number = 0
    connection( 'benefits' )
      .insert( benefit )
      .then( ( [ benefit ] ) => connection( 'associates' ).insert( { ...associated, benefit } ) )
      .then( ( [ associated ] ) => {
        associatedId = associated
        return Promise.all( [
          connection( 'associates_addresses' )
            .insert( addresses.map( address => ( { ...address, associated } ) ) ),
          connection( 'associates_phones' )
            .insert( phones.map( phone => ( { ...phone, associated } ) ) )
        ] )
          .then( () => associated )
      } )
      .then( ( associated = associatedId ) => {
        let logo = null
        if ( req.body.logo?.match( /data:image\/(jpeg|png);base64/ ) ) {
          const fileExtension = req.body.logo.replace( /data:image\/(jpeg|png);base64.*/, '$1' )
          const base64Image = req.body.logo.replace( /data:image\/(jpeg|png);base64/, '' )
          const dirpath = `public/associates/${associated}`
          if ( !fs.existsSync( dirpath ) ) fs.mkdirSync( dirpath, { recursive: true } )
          const fullpath = `${dirpath}/logo.${fileExtension}`
          logo = `http://${req.hostname}:${req.socket.localPort}/${fullpath}`
          fs.writeFileSync( fullpath, base64Image, { encoding: 'base64' } )
        } else if ( req.body.logo ) logo = req.body.logo

        return connection( 'associates' )
          .where( 'associates.id', associated )
          .update( { logo } )
          .then( () => associated )
      } )
      .then( ( associated = associatedId ) => {
        if ( req.hostname.startsWith( 'api' ) )
          return res.redirect( 303, `/associates/${associated}` )
        return res.redirect( 303, `/api/associates/${associated}` )
      } )
      .catch( next )
  } )

associates.route( '/associates/categories' )
  .get( ( req, res, next ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

    const user: string | null = req.query?.user?.toString() || null

    const query = connection( 'benefits_categories' )
      .select( '*' )
      .limit( limit )
      .offset( page * limit )
      .orderBy( order, orderType )

    if ( !excluded ) { /* query.whereNull( 'deleted_at' ) */ }

    if ( excluded === 'only' ) { /* query.whereNotNull( 'deleted_at' ) */ }

    if ( like ) query.where( 'name', 'like', `%${like}%` )

    if ( user )
      query
        .leftJoin( 'favorite_categories', clause => {
        // @ts-ignore
          clause.on( 'favorite_categories.user', '=', parseInt( user, 10 ) )
            .andOn( 'favorite_categories.category', '=', 'benefits_categories.id' )
        } )
        .column( connection.raw( 'CASE WHEN favorite_categories.user IS NULL THEN 0 ELSE 1 END AS favorite' ) )

    query
      .then( res.json.bind( res ) )
      .catch( next )
  } )

associates.route( '/associates/:id' )
  .get( ( req, res, next ) => {
    connection( 'associates' )
      .select(
        'associates.*',
        'benefits.title AS benefit_title',
        'benefits_categories.name AS benefit_category',
        'benefits.discount AS benefit_discount',
        'benefits.description AS benefit_description',
        connection.raw( 'GROUP_CONCAT( DISTINCT associates_addresses.address SEPARATOR \'|\' ) AS address' ),
        connection.raw( 'GROUP_CONCAT( DISTINCT associates_phones.phone SEPARATOR \'|\' ) AS phones' ),
      )
      .leftJoin( 'associates_addresses', 'associates_addresses.associated', 'associates.id' )
      .leftJoin( 'associates_phones', 'associates_phones.associated', 'associates.id' )
      .join( 'benefits', 'benefits.id', 'associates.id' )
      .join( 'benefits_categories', 'benefits.category', 'benefits_categories.id' )
      .groupBy( 'associates.id' )
      .where( 'associates.id', req.params.id )
      .first()
      .then( row => ( {
        ...row,
        address: row.address?.split( '|' ) || [],
        phones: row.phones?.split( '|' ) || [],
        discount: row.benefit_discount,
        category: row.benefit_category,
        favorite: row.favorite !== undefined ? Boolean( row.favorite ) : undefined
      } ) )
      .then( res.json.bind( res ) )
      .catch( next )
  } )
  .put( ( req, res ) => res.json() )
  .patch( ( req, res, next ) => {
    let logo = null
    if ( req.body.logo?.match( /data:image\/(jpeg|png);base64/ ) ) {
      const fileExtension = req.body.logo.replace( /data:image\/(jpeg|png);base64.*/, '$1' )
      const base64Image = req.body.logo.replace( /data:image\/(jpeg|png);base64/, '' )
      const dirpath = `public/associates/${req.params.id}`
      if ( !fs.existsSync( dirpath ) ) fs.mkdirSync( dirpath, { recursive: true } )
      const fullpath = `${dirpath}/logo.${fileExtension}`
      logo = `http://${req.hostname}:${req.socket.localPort}/${fullpath}`
      fs.writeFileSync( fullpath, base64Image, { encoding: 'base64' } )
    } else if ( req.body.logo ) logo = req.body.logo

    const associated = {
      name: req.body.name,
      description: req.body.description,
      logo
    }

    const benefit = {
      title: req.body.benefit_title,
      discount: req.body.benefit_discount,
      description: req.body.benefit_description,
      category: req.body.benefit_category,
    }

    Object.keys( benefit ).forEach( _key => {
      const key = _key as any as keyof typeof benefit
      if ( benefit[key] === undefined ) delete benefit[key]
    } )

    Object.keys( associated ).forEach( _key => {
      const key = _key as any as keyof typeof associated
      if ( associated[key] === undefined ) delete associated[key]
    } )

    const addresses: any[] = req.body.addresses || []

    const phones: any[] = req.body.phones || []

    console.log( { phones, addresses } )

    connection( 'associates' )
      .where( 'associates.id', req.params.id )
      .update( associated )
      .then( () =>
        connection( 'associates' )
          .select( '*' )
          .where( 'associates.id', req.params.id )
          .first()
      )
      .then( async associated => {
        await connection( 'benefits' )
          .where( 'id', associated.benefit )
          .update( benefit )

        const addressesIds: number[] = addresses.filter( address => !!address.id ).map( address => address.id )

        await connection( 'associates_addresses' )
          .where( 'associates_addresses.associated', associated.id )
          .whereNotIn( 'associates_addresses.id', addressesIds )
          .delete()

        const addressesPromises = addresses.map( address => {
          if ( !address.id ) return connection( 'associates_addresses' )
            .insert( { ...address, associated: associated.id } )
            .then( () => void 0 )

          const id = address.id
          delete address.id
          return connection( 'associates_addresses' )
            .where( 'associates_addresses.id', id )
            .update( address )
            .then( () => void 0 )
        } )

        await Promise.all( addressesPromises )

        const phonesIds: number[] = phones.filter( phone => !!phone.id ).map( phone => phone.id )

        await connection( 'associates_phones' )
          .where( 'associates_phones.associated', associated.id )
          .whereNotIn( 'associates_phones.id', phonesIds )
          .delete()

        const phonesPromises = phones.map( phone => {
          if ( !phone.id ) return connection( 'associates_phones' )
            .insert( { ...phone, associated: associated.id } )
            .then( () => void 0 )

          const id = phone.id
          delete phone.id
          return connection( 'associates_phones' )
            .where( 'associates_phones.id', id )
            .update( phone )
            .then( () => void 0 )
        } )

        await Promise.all( phonesPromises )

        return associated.id
      } )
      .then( associated => {
        if ( req.hostname.startsWith( 'api' ) )
          return res.redirect( 303, `/associates/${associated}` )
        return res.redirect( 303, `/api/associates/${associated}` )
      } )
      .catch( next )
  } )
  .delete( ( req, res, next ) => {
    connection( 'associates' )
      .where( 'id', req.params.id )
      .update( { deleted_at: new Date() } )
      .then( () => res.json( { success: true } ) )
      .catch( next )
  } )

export default associates
