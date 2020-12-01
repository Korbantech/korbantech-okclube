import connection from '@helpers/connection'
import Express from 'express'

const coupons = Express.Router()


coupons.route( '/coupons' ).
  post( async ( req, res ) => {

    const maxUserCouponByAssociateByDate = 1

    const user      = req?.body?.user
    const coupon    = req?.body?.coupon
    const associate = req?.body?.associate

    if(
      !user
      || !coupon
      || !associate
    ) return res.status( 400 ).json( { message: 'missing paramters' } )

    const generated:any[] = await connection( 'coupons' )
      .select(
        'coupon'
      )
      .where( 'user', user )
      .where( 'associate', associate )
      .whereRaw( 'DATE(created_at) = CURDATE()' )
      .then( ( res:any ) => {
        return res
      } )
      .catch( err =>{
        console.log( err )
        return []
      } )

    if( generated.length >= maxUserCouponByAssociateByDate ){
      return res.json( { coupon: generated[ generated.length - 1 ].coupon } )
    }


    const newCoupon = await connection( 'coupons' ).insert( {
      associate,
      coupon,
      user
    } ).then( ( ) => true ).catch( err => {
      console.log( err )
      return false
    } )

    if( !newCoupon ) return res.status( 500 )

    return res.json( { coupon } )
  } )

export = coupons