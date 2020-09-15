import React from 'react'
import Booklist from './Booklist'
import { useQuery } from '@apollo/client'
import { ME } from '../queries'

const Recommendations = ({ show, books }) => {
  const me = useQuery(ME)
  if (!show || !me) return null

  const favouriteGenre = me.data.me.favouriteGenre

  return (
    <div>
      <h1>recommendations</h1>
      <p>
        books in your favourite genre <b>{favouriteGenre}</b>
      </p>
      <Booklist
        books={books.filter((book) => book.genres.includes(favouriteGenre))}
      />
    </div>
  )
}

export default Recommendations
