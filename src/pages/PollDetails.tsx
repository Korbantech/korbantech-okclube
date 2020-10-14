import React, { useEffect, useMemo, useCallback } from 'react'
import ReactInfiniteScroll from 'react-infinite-scroll-component'
import { useParams } from 'react-router-dom'

import Loading from '@components/Loading'
import usePagination from '@hooks/usePagination'
import useRequest from '@hooks/useRequest'
import moment from 'moment'
import styled from 'styled-components'

const PollDetails = () => {
  const params = useParams<any>()
  const { init, send, data } = useRequest<any>( `/polls/${params.poll}/details` )
  const pagination = usePagination<any>( `/polls/${params.poll}/comments` )

  useEffect( () => {
    if ( !init ) send()
  }, [ init, send ] )

  const responses = useMemo<Record<'yes' | 'no', number>>( () => {
    return Object.assign( { no: 0, yes: 0 }, data )
  }, [ data ] )

  const next = useCallback( () => {
    if ( !pagination.loading ) return pagination.load()
  }, [ pagination ] )

  return (
    <Container>
      { data
        ? 
        <>
          <h1 className='title' style={ { margin: '1.5rem' } }>{data.text}</h1>
          <section className='section' style={ { padding: '0.5rem 1.5rem' } }>
            <h2 className='subtitle is-4'>
              Respostas
            </h2>
            <div className='columns'>
              <div className='column'>
                <h3 className='title'>
                  <span className='is-5'>Sim: </span>
                  {responses.yes}
                </h3>
              </div>
              <div className='column'>
                <h3 className='title'>
                  <span className='is-5'>Não: </span>
                  {responses.no}
                </h3>
              </div>
            </div>
          </section>
          <section className='section' style={ { padding: '0.5rem 1.5rem', height: '100%' } }>
            <h2 className='subtitle is-4'>
              Comentários:
            </h2>
            <Comments id='comments-container'>
              <ReactInfiniteScroll
                dataLength={pagination.list.length} //This is important field to render the next data
                next={next}
                hasMore={!pagination.end}
                loader={(
                  <Loader>
                    <Loading size={50}/>
                    <h4>Carregando...</h4>
                  </Loader>
                )}
                style={ { overflow: 'unset' } }
                scrollableTarget='comments-container'
              >
                { pagination.list.length
                  ? pagination.list.map( ( comment, index ) => 
                    <article className="media" key={`comment-${index}`}>
                      <figure className="media-left">
                        <p className="image is-64x64">
                          <img src={comment.user_data.photo} />
                        </p>
                      </figure>
                      <div className="media-content">
                        <div className="content">
                          <p>
                            <strong>{comment.user_data.name} </strong>
                            <small>{comment.user_data.email} </small>
                            <small>
                              { moment( comment.created_at )
                                .fromNow() }
                            </small>
                            <br />
                            {comment.comment}
                          </p>
                        </div>
                        <nav className="level is-mobile">
                          <div className="level-left">
                            <a className="level-item">
                              <span className="icon is-small"><i className="fas fa-reply" /></span>
                            </a>
                            <a className="level-item">
                              <span className="icon is-small"><i className="fas fa-retweet" /></span>
                            </a>
                            <a className="level-item">
                              <span className="icon is-small"><i className="fas fa-heart" /></span>
                            </a>
                          </div>
                        </nav>
                      </div>
                      <div className="media-right">
                        <button className="delete" onClick={ () => {} }/>
                      </div>
                    </article>
                  )
                  :
                  <div className='columns'>
                    <div className='column'>
                      Nenhum comentário
                    </div>
                  </div>
                }
              </ReactInfiniteScroll>
            </Comments>
          </section>
        </>
        : 
        <Loader>
          <Loading size={50}/>
          <h4>Carregando...</h4>
        </Loader>
      }
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
`

const Loader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`

const Comments = styled.div`
  overflow-y: scroll;
  overflow-x: hidden;
  height: 60%;
`

export = PollDetails
