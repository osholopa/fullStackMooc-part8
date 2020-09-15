import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_BOOK, ALL_BOOKS, ALL_AUTHORS, BOOKS_BY_GENRE } from '../queries'

const NewBook = ({ show, setError, favouriteGenre }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [createBook] = useMutation(CREATE_BOOK, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
      setTimeout(() => {
        setError(null)
      }, 5000)
    },
    update: (store, response) => {
      const booksInStore = store.readQuery({ query: ALL_BOOKS })
      store.writeQuery({
        query: ALL_BOOKS,
        data: {
          ...booksInStore,
          allBooks: [...booksInStore.allBooks, response.data.addBook],
        },
      })

      const authorsInStore = store.readQuery({ query: ALL_AUTHORS })
      if (
        authorsInStore.allAuthors.filter(
          (a) => a.name === response.data.addBook.author.name
        ).length === 0
      ) {
        store.writeQuery({
          query: ALL_AUTHORS,
          data: {
            ...authorsInStore,
            allAuthors: [
              ...authorsInStore.allAuthors,
              response.data.addBook.author,
            ],
          },
        })
      }

      if (response.data.addBook.genres.includes(favouriteGenre)) {
        const favouriteBooks = store.readQuery({
          query: BOOKS_BY_GENRE,
          variables: { genre: favouriteGenre },
        })

        store.writeQuery({
          query: BOOKS_BY_GENRE,
          variables: { genre: favouriteGenre },
          data: {
            ...favouriteBooks,
            allBooks: [...favouriteBooks.allBooks, response.data.addBook],
          },
        })
      }
    },
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    createBook({ variables: { title, author, published, genres } })
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
