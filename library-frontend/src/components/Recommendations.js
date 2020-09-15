import React, { useState, useEffect } from 'react'
import Booklist from './Booklist'
import { useLazyQuery } from '@apollo/client'
import { BOOKS_BY_GENRE } from '../queries'

const Recommendations = ({ show, favouriteGenre }) => {
  const [favouriteBooks, setFavouriteBooks] = useState(null)

  const [getBooksByGenre, result] = useLazyQuery(BOOKS_BY_GENRE, {
    onError: (error) => {
      console.log(error)
    },
  })

  useEffect(() => {
    if (result.data) {
      setFavouriteBooks(result.data.allBooks)
    }
  }, [result.data])

  useEffect(() => {
    if (show && favouriteGenre) {
      getBooksByGenre({ variables: { genre: favouriteGenre } })
    }
  }, [show, favouriteGenre]) //eslint-disable-line

  if (!show || !favouriteBooks) return null

  return (
    <div>
      <h1>recommendations</h1>
      <p>
        books in your favourite genre <b>{favouriteGenre}</b>
      </p>
      <Booklist books={favouriteBooks} />
    </div>
  )
}

export default Recommendations
