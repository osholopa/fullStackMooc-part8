import React from 'react'
import Booklist from './Booklist'

const Recommendations = ({ show, favouriteGenre, favouriteBooks }) => {
  if (!show || !favouriteGenre || !favouriteBooks) return null

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
