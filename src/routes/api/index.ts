import Times from '@cookiex/times'
import axios, { AxiosError } from 'axios'
import Express from 'express'
import fs from 'fs'

import connection from '../../helpers/connection'
import Associated from '../../typings/associated'

const ndErrorStream = fs.createWriteStream( 'nd-error.log' )

const api = Express.Router()

api.route( '/user' )
  .post( async ( req, res ) => {
    const user = {
      mail: req.body.mail,
      name: req.body.name,
      pass: req.body.pass
    }

    const useId = ( await connection( 'users' )
      .insert( user ) ).pop()

    const ndInfo = {
      tel: req.body.tel,
      zipCode: req.body.zipCode || req.body.zip_code,
      document: req.body.document,
      address: req.body.address,
      contract: req.body.contract,
      valid: req.body.valid,
      user: useId
    }

    await connection( 'users_nd_info' )
      .insert( ndInfo )

    res.json( {} )
  } )

  .put( async ( req, res ) => {

    const id = req.body.id || req.body.user || req.body.userId

    const user = {
      mail: req.body.mail,
      name: req.body.name,
      pass: req.body.pass
    }

    await connection( 'users' )
      .update( user )
      .where( 'id', '=', id )

    const ndInfo = {
      tel: req.body.tel,
      zip_code: req.body.zipCode || req.body.zip_code,
      document: req.body.document,
      address: req.body.address,
      contract: req.body.contract,
      valid: req.body.valid
    }

    const metaInfo = {
      facebook_uri: req.body.facebook,
      twitter_uri: req.body.twitter,
      instagram_uri: req.body.instagram,
      birthday: new Date( req.body.birthday )  
    }

    let photo: string | null = req.body.photo?.replace( /^data:image\/[a-z]{3,4};base64,/, '' ) || null

    await connection( 'users_nd_info' )
      .update( ndInfo )
      .where( 'user', '=', id )

    await connection( 'users_meta_info' )
      .update( metaInfo )
      .where( 'user', '=', id )

    await connection( 'users_photos' )
      .delete()
      .where( 'user', '=', id )

    if ( photo ) {

      if ( /^https?:\/\//.test( photo ) ) {
        await connection( 'users_photos' )
          .insert( {
            user: id,
            photo
          } )
      }

      else {
        if ( !fs.existsSync( 'public/users/images' ) )
          fs.mkdirSync( 'public/users/images', { recursive: true } )

        try {

          fs.writeFileSync( `public/users/images/${id}-photo.jpg`, photo, 'base64' )

          photo = `http://dashboard.nd.homolog.korbantech.com.br:9000/public/users/images/${id}-photo.jpg?at=${new Date().getTime()}`

          await connection( 'users_photos' )
            .insert( {
              user: id,
              photo
            } )

        } catch { photo = null }
      }
    }

    const meta = {
      facebook: metaInfo.facebook_uri,
      twitter: metaInfo.twitter_uri,
      instagram: metaInfo.instagram_uri,
      birthday: metaInfo.birthday
    }

    res.json( { ...user, ...ndInfo, ...meta, photo, id } )
  } )

api.get( '/register/:cpf', async ( req, res ) => {
  const document = req.params?.cpf?.toString().replace( /\.|-/, '' ) || ''

  const user = await connection( 'users' )
    .select( '*' )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .where( 'users_nd_info.document', document )
    .first()

  if ( !user ) {
    const url = 'https://sac.ndonline.com.br/clubedoassinante/rest/clube/dados/identmf/' + document
    const start = Date.now()
    let data
    try {
      data = ( await axios.get( url ) ).data
    } catch ( e ) {
      const err: AxiosError = e
      data = err.response?.data
      ndErrorStream.write( 'TimeOut Sac\n' )
    } finally {
      console.log( `request end - ${ Date.now() - start }ms` )
    }

    if ( !Array.isArray( data ) ) return res.status( 500 ).json()

    data = data.shift()

    if ( data.codigoDaPessoaAssinante === 0 ) {
      const user = ( await connection( 'users' )
        .insert( {} ) ).pop()
      await connection( 'users_nd_info' ).insert( {
        user,
        document,
      } ) 
      return res.json( { id: user, document } )
    }

    const user = ( await connection( 'users' )
      .insert( {
        name: data.nomeDoAssinante,
        mail: data.email
      } ) ).pop()

    await connection( 'users_nd_info' ).insert( {
      user,
      code: data.codigoDaPessoaAssinante,
      document: data.identMF,
      valid: data.dataDeValidade
    } )

    const info = await connection( 'users' )
      .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
      .where( 'users.id', user )
      .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
      .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
      .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
      .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
      .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
      .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
      .first()

    return res.json( await info )
  }

  res.status( 200 ).json( { ...user, alreadyExists: true } )
} )

api.get( '/login', async ( req, res ) => {

  const mail = req.query?.mail?.toString() || ''
  const pass = req.query?.pass?.toString() || ''
  const params = `loginDoUsuarioAssinante=${mail}&senhaDoUsuarioAssinante=${pass}`

  let user = await connection( 'users' )
    .select( [ 'users.*', 'users_nd_info.*', 'users_meta_info.birthday', 'users_photos.photo' ] )
    .where( 'users.mail', mail )
    .where( 'users.pass', pass )
    .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
    .leftJoin( 'users_meta_info', 'users_meta_info.user', 'users.id' )
    .leftJoin( 'users_photos', 'users_photos.user', 'users.id' )
    .column( connection.raw( 'users_meta_info.facebook_uri AS facebook' ) )
    .column( connection.raw( 'users_meta_info.twitter_uri AS twitter' ) )
    .column( connection.raw( 'users_meta_info.instagram_uri AS instagram' ) )
    .first()

  if ( !user ) {
    const url = 'https://sac.ndonline.com.br' +
    ':8023' +
    '/axis2/services/Assinante/getLoginAssinanturasAtivasWeb' +
    '?' + params
    const response = await axios.get( url )

    const data = response.data
      .replace( '<ns:getLoginAssinanturasAtivasWebResponse xmlns:ns="http://webservice.control.gestor"><ns:return>', '' )
      .replace( '</ns:return></ns:getLoginAssinanturasAtivasWebResponse>', '' )

    const ndUser = JSON.parse( data ).pop()

    console.log( JSON.stringify( ndUser, null, 2 ) )

    if ( ndUser.loginDoUsuarioAssinante === 'Usuário/Senha inválido.' )
      return res.status( 401 ).json( {} )

    let userId = ( await connection( 'users' )
      .insert( {
        mail,
        pass,
        name: ndUser.nomeRazaoSocial,
      } ) ).pop()

    await connection( 'users_nd_info' )
      .insert( {
        user: userId,
        code: ndUser.codigoDoAssinante,
        tel: ndUser.telefone,
        zip_code: ndUser.cep,
        document: ndUser.identMF,
        address: `${ndUser.nomeDoLogradouro}, ${ndUser.numeroDoEndereco} - ${ndUser.nomeDoBairro} - ${ndUser.nomeDoMunicipio}/${ndUser.siglaDaUf}`,
        contract: ndUser.numeroDoContrato,
        valid: new Date(
          ndUser.dataDevalidadeFinal.replace( '^([0-9]{4})-([0-9]{2})-([0-9]{2}).*', '$1-$2-$3' )
        )
      } )

    user = await connection( 'users' )
      .select( '*' )
      .where( 'users.id', userId )
      .join( 'users_nd_info', 'users_nd_info.user', 'users.id' )
      .first()
  }

  res.json( user )
} )

api.route( '/newspapers' )
  .get( async ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null
    const from: Times.Date | null = req.query?.from && new Times.Date( req.query?.from.toString() ) || null
    const to: Times.Date | null = req.query?.to && new Times.Date( req.query?.to.toString() ) || null

    const query = connection( 'newspaper_editions' )
      .select( '*' )
      .limit( limit )
      .offset( page * limit )
      .orderBy( order, orderType )

    if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

    if ( like ) query.where( 'name', 'like', `%${like}%` )

    if ( from )
      if ( to ) query.whereBetween( 'screening_date', [ from, to ] )
      else query.where( 'screening_date', '>', from )

    else if ( to ) query.where( 'screening_date', '<', from )

    res.json( await query )
  } )

api.route( '/newspapers/editions' )
  .get( async ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null
    const newspapers = req.query?.newspapers?.toString()
      .split( /,| / )
      .map( item => parseInt( item ) ) || []

    const query = connection( 'newspaper_editions' )
      .select( '*' )
      .limit( limit )
      .offset( page * limit )
      .orderBy( order, orderType )

    if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

    if ( like ) query.where( 'name', 'like', `%${like}%` )

    if ( newspapers.length ) query.whereIn( 'newspaper', newspapers )

    res.json( await query )
  } )

api.route( '/newspaper/:id/edition' )
  .post( async ( req, res ) => { res.json( {} ) } )

api.route( '/newspaper/:id/editions' )
  .get( async ( req, res ) => {
    const limit = parseInt( req.query?.per?.toString() || '30' )
    const page = parseInt( req.query?.page?.toString() || '0' )
    const order = req.query?.order?.toString() || 'id'
    const orderType: 'desc' | 'asc' = req.query?.desc ? 'desc' : 'asc'
    const like: null | string = req.query?.like?.toString() || null
    const excluded: 'on' | 'only' | 'true' | null =
      req.query?.excluded?.toString() as 'on' | 'only' | 'true' || null

    const query = connection( 'newspaper_editions' )
      .select( '*' )
      .limit( limit )
      .offset( page * limit )
      .orderBy( order, orderType )

    if ( excluded === 'only' ) query.whereNotNull( 'deleted_at' )

    if ( like ) query.where( 'name', 'like', `%${like}%` )

    query.where( 'newspaper', '=', req.params.id )

    res.json( await query )
  } )

api.route( '/newspapers/edition/:id' )
  .get( async ( req, res ) => {
    const edition = await connection( 'newspaper_editions' )
      .select( '*' )
      .where( 'newspaper_editions.id', req.params.id )
      .first()

    if ( !edition ) return res.status( 404 ).json( {} )

    res.json( edition )
  } )

api.route( '/associated' )
  .post( async ( req, res ) => {
    const associated: Partial<Associated> = req.body

    if ( !associated.name || !associated.benefit )
      return res.status( 400 ).json( {} )

    res.json( {} )
  } )

api.route( '/associated/:id' )
  .get( async ( req, res ) => {
    const associated = await connection( 'associates' )
      .select( '*' )
      .where( 'associates.id', req.params.id )
      .first()

    if ( !associated ) return res.status( 404 ).json( {} )

    res.json( associated )
  } )
  .delete( async ( req, res ) => {

    const affected = await connection( 'associates' )
      .update( {
        deleted_at: connection.fn.now( 6 )
      } )

    if ( !affected ) return res.json( {} )
    
    res.json( {} )
  } )

api.route( '/associates/categories' )
  .get( async ( req, res ) => {
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

    return res.json( await query )
  } )

api.post( '/user/category/favorite', async ( req, res ) => {
  const user = req.body.user
  const category = req.body.category

  await connection( 'favorite_categories' )
    .insert( { user, category } )

  res.json( {} )
} )

api.delete( '/user/category/favorite', async ( req, res ) => {
  const user = req.body.user
  const category = req.body.category

  await connection( 'favorite_categories' )
    .delete()
    .where( 'user', user )
    .where( 'category', category )

  res.json( {} )
} )

api.post( '/user/associated/favorite', async ( req, res ) => {
  const user = req.body.user
  const associated = req.body.associated

  await connection( 'favorite_associates' )
    .insert( { user, associated } )

  res.json( {} )
} )

api.delete( '/user/associated/favorite', async ( req, res ) => {
  const user = req.body.user
  const associated = req.body.associated

  await connection( 'favorite_associates' )
    .delete()
    .where( 'user', user )
    .where( 'associated', associated )

  res.json( {} )
} )


api.route( '/associates' )
  .get( async ( req, res ) => {
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
  
    return res.json( ( await query ).map( row => ( {
      ...row,
      address: row.address?.split( '|' ) || [],
      phones: row.phones?.split( '|' ) || [],
      discount: row.benefit_discount,
      category: row.benefit_category,
      favorite: row.favorite !== undefined ? Boolean( row.favorite ) : undefined
    } ) ) )
  } )

api.all( '*', ( req, res ) => {
  res.status( 404 ).json( {} )
} )

export default api
