import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommendations from './components/Recommendations'
import {
  useApolloClient,
  useQuery,
  useLazyQuery,
  useSubscription,
} from '@apollo/client'
import LoginForm from './components/LoginForm'
import { ALL_AUTHORS, ALL_BOOKS, ALL_GENRES, ME, BOOK_ADDED } from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const [favouriteGenre, setFavouriteGenre] = useState(null)

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const genres = useQuery(ALL_GENRES)

  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      let book = subscriptionData.data.bookAdded
      console.log('book added', book)
      window.alert(
        `New book added: ${book.title} by ${book.author.name}. Check browser console for more info`
      )
    },
  })

  const [getUser, result] = useLazyQuery(ME, {
    onCompleted: () => {
      setFavouriteGenre(result.data.me.favouriteGenre)
    },
  })

  useEffect(() => {
    if (localStorage.getItem('library-user-token')) {
      setToken(localStorage.getItem('library-user-token'))
    }
  }, [])

  useEffect(() => {
    if (token) {
      getUser()
    }
  }, [token]) //eslint-disable-line

  const logout = () => {
    setPage('authors')
    setToken(null)
    setFavouriteGenre(null)
    localStorage.clear()
    client.resetStore()
  }

  const loginFormProps = {
    show: page === 'login',
    setError: setError,
    setToken: setToken,
    setPage: setPage,
  }

  if (authors.loading || books.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendations')}>
              recommend
            </button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      {error ? <div style={{ color: 'red' }}>{error}</div> : null}

      <Authors
        show={page === 'authors'}
        authors={authors.data.allAuthors}
        setError={setError}
      />

      <Books
        show={page === 'books'}
        books={books.data.allBooks}
        genres={genres.data.allGenres}
      />

      <LoginForm {...loginFormProps} />
      {favouriteGenre ? (
        <>
          <NewBook
            show={page === 'add'}
            setError={setError}
            favouriteGenre={favouriteGenre}
          />

          <Recommendations
            show={page === 'recommendations'}
            favouriteGenre={favouriteGenre}
          />
        </>
      ) : null}
    </div>
  )
}

export default App
