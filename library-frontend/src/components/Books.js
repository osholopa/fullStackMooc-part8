import React, { useEffect, useState } from 'react'
import Booklist from './Booklist'

const Books = ({ show, books, genres }) => {
  const [genre, setGenre] = useState(null)
  const [booksToShow, setBooksToShow] = useState([])

  useEffect(() => {
    if (genre) {
      setBooksToShow(books.filter((book) => book.genres.includes(genre)))
    } else {
      setBooksToShow(books)
    }
  }, [genre, books]) //eslint-disable-line

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>books</h2>
      {genre ? (
        <p>
          in genre <b>{genre}</b>
        </p>
      ) : null}
      <Booklist books={booksToShow} />
      {genres.map((genre) => (
        <button
          onClick={() => {
            setGenre(genre)
          }}
          key={genre}
        >
          {genre}
        </button>
      ))}
      <button onClick={() => setGenre(null)}>all genres</button>
    </div>
  )
}

export default Books
