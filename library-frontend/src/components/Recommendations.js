import React, { useState, useEffect } from 'react'
import Booklist from './Booklist'
import { useLazyQuery } from '@apollo/client'
import { BOOKS_BY_GENRE } from '../queries'

const Recommendations = ({ show, favouriteGenre, setError }) => {
  const [books, setBooks] = useState([])
  const [getBooksByGenre, result] = useLazyQuery(BOOKS_BY_GENRE, {
    onError: (error) => {
      setError(error)
      setTimeout(() => {
        setError(null)
      }, 5000)
    },
  })

  useEffect(() => {
    if (show && favouriteGenre) {
      getBooksByGenre({ variables: { genre: favouriteGenre } })
    }
  }, [show]) //eslint-disable-line

  useEffect(() => {
    if (result.data) {
      setBooks(result.data.allBooks)
    }
  }, [result.data])

  if (!show || !favouriteGenre) return null

  return (
    <div>
      <h1>recommendations</h1>
      <p>
        books in your favourite genre <b>{favouriteGenre}</b>
      </p>
      <Booklist books={books} />
    </div>
  )
}

export default Recommendations
