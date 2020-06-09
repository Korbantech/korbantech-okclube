import connection from '../src/helpers/connection'

connection( 'users' )
  .insert( {
    name: 'Anthony Edward Stark Jr',
    mail: 'tony@stark.com',
    pass: 123456,
  } )
  .then( ( [ user ] ) => {
    Promise.all( [ connection( 'users_nd_info' )
      .insert( {
        user,
        code: '*',
        tel: '(41)9919199191',
        document: '802.169.230-85',
        zip_code: '80420-210',
        valid: new Date( '2030-01-01T12:00:00Z' ),
        contract: '*'
      } ), connection( 'users_meta_info' )
      .insert( {
        user,
        birthday: new Date( '1970-05-29T12:00:00Z' ),
        facebook_uri: 'facebook.co,/zsolt.bodnar.5836',
        instagram_uri: 'instagram.com/ironman.official'
      } ), ] )
      .then( () => {
        console.log( 'finish' )
        connection.destroy()
      } )
  } )
