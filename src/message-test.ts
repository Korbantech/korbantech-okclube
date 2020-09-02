import sendNotification from './tools/sendNotification'

( async () => {
  const response = await sendNotification( {
    filter: user => user.id === 1,
    notification: {
      title: 'Teste Notificação',
      body: 'Teste'
    }
  } )

  response.forEach( result => {
    result.results.forEach( result => {
      if ( result.error ) console.log(
        `(${result.error.code})\n${result.error.message}`
      )
    } )
  } )

  process.exit()
} )()
