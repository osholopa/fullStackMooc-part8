import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { useApolloClient, useQuery } from '@apollo/client'
import LoginForm from './components/LoginForm'
import { ALL_AUTHORS, ALL_BOOKS } from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (authors.loading || books.loading) {
    return <div>loading...</div>
  }

  const loginFormProps = {
    show: page === 'login',
    setError: setError,
    setToken: setToken,
    setPage: setPage,
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
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

      <Books show={page === 'books'} books={books.data.allBooks} />

      <LoginForm {...loginFormProps} />

      <NewBook show={page === 'add'} setError={setError} />
    </div>
  )
}

export default App
