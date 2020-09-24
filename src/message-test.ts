import connection from './helpers/connection'

connection( 'polls' )
  .select( connection.raw( 'COUNT( polls_comments.poll ) AS comments_count' ) )
  .select( connection.raw( 'JSON_OBJECTAGG( responses.key, responses.value ) AS responses' ) )
  .leftJoin(
    connection( 'polls_responses' )
      .select( 'polls_responses.poll' )
      .select( connection.raw( 'polls_responses.response AS `key`' ) )
      .select( connection.raw( 'COUNT( polls_responses.user ) AS `value`' ) )
      .groupBy( 'polls_responses.poll', 'polls_responses.response' )
      .as( 'responses' ),
    'responses.poll', 'polls.id' )
  .leftJoin( 'polls_comments', 'polls_comments.poll', 'polls.id' )
  .groupBy( 'polls.id' )
  .then( console.log )
  .catch( console.error )
  .finally( () => {
    connection.destroy()
  } )
