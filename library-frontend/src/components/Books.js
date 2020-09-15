import React, { useEffect, useState } from 'react'

const Books = ({ show, books, genres }) => {
  const [genre, setGenre] = useState(null)
  const [booksToShow, setBooksToShow] = useState([])

  useEffect(() => {
    if (genre) {
      setBooksToShow(books.filter((book) => book.genres.includes(genre)))
    } else {
      setBooksToShow(books)
    }
  }, [genre]) //eslint-disable-line

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
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
