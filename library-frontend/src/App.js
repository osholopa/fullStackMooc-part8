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
import {
  ALL_AUTHORS,
  ALL_BOOKS,
  ALL_GENRES,
  ME,
  BOOK_ADDED,
  BOOKS_BY_GENRE,
} from './queries'

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const [favouriteGenre, setFavouriteGenre] = useState(null)

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const genres = useQuery(ALL_GENRES)

  const client = useApolloClient()

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

  const [getBooksByGenre, favouriteBooksResult] = useLazyQuery(BOOKS_BY_GENRE, {
    onError: (error) => {
      console.log(error)
    },
  })

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      let book = subscriptionData.data.bookAdded
      console.log('book added', book)
      window.alert(
        `New book added: ${book.title} by ${book.author.name}. Check browser console for more info`
      )
      updateCacheWith(book)
    },
  })

  const [favouriteBooks, setFavouriteBooks] = useState(null)

  useEffect(() => {
    if (favouriteBooksResult.data) {
      setFavouriteBooks(favouriteBooksResult.data.allBooks)
    }
  }, [favouriteBooksResult.data])

  const [getUser, user] = useLazyQuery(ME, {
    onCompleted: () => {
      setFavouriteGenre(user.data.me.favouriteGenre)
    },
  })

  useEffect(() => {
    if (favouriteGenre) {
      getBooksByGenre({ variables: { genre: favouriteGenre } })
    }
  }, [favouriteGenre]) //eslint-disable-line

  const updateCacheWith = (addedBook) => {
    const bookIncludedIn = (set, object) =>
      set.map((b) => b.id).includes(object.id)
    const booksInStore = client.readQuery({ query: ALL_BOOKS })
    if (!bookIncludedIn(booksInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: booksInStore.allBooks.concat(addedBook) },
      })
    }
    const authorIncludedIn = (set, object) =>
      set.map((b) => b.id).includes(object.author.id)
    const authorsInStore = client.readQuery({ query: ALL_AUTHORS })
    if (!authorIncludedIn(authorsInStore.allAuthors, addedBook)) {
      client.writeQuery({
        query: ALL_AUTHORS,
        data: {
          allAuthors: authorsInStore.allAuthors.concat(addedBook.author),
        },
      })
    }
    if (favouriteGenre && addedBook.genres.includes(favouriteGenre)) {
      const favouriteBooksInStore = client.readQuery({
        query: BOOKS_BY_GENRE,
        variables: { genre: favouriteGenre },
      })
      if (!bookIncludedIn(favouriteBooksInStore.allBooks, addedBook)) {
        client.writeQuery({
          query: BOOKS_BY_GENRE,
          variables: { genre: favouriteGenre },
          data: {
            allBooks: favouriteBooksInStore.allBooks.concat(addedBook),
          },
        })
      }
    }
  }

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
      <Authors show={page === 'authors'} authors={authors.data.allAuthors} />
      <Books
        show={page === 'books'}
        books={books.data.allBooks}
        genres={genres.data.allGenres}
      />
      <LoginForm {...loginFormProps} />
      <NewBook show={page === 'add'} updateCacheWith={updateCacheWith} />
      <Recommendations
        show={page === 'recommendations'}
        favouriteGenre={favouriteGenre}
        favouriteBooks={favouriteBooks}
      />
    </div>
  )
}

export default App
