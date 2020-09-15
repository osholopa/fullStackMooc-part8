const {
  ApolloServer,
  UserInputError,
  AuthenticationError,
  PubSub,
} = require('apollo-server')
const mongoose = require('mongoose')
const config = require('./utils/config')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const typeDefs = require('./gql/schema')
const jwt = require('jsonwebtoken')
const pubsub = new PubSub()

console.log('connecting to MongoDB')

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let books = await Book.find({}).populate('author', {
        name: 1,
        born: 1,
        bookCount: 1,
      })
      if (!args.author && !args.genre) return books
      if (args.author)
        books = books.filter((b) => b.author.name === args.author)
      if (args.genre) books = books.filter((b) => b.genres.includes(args.genre))
      return books
    },
    allAuthors: () => Author.find({}),
    allGenres: async () => {
      const books = await Book.find({})
      let genres = []
      books.forEach((book) => {
        book.genres.forEach((genre) => {
          if (!genres.includes(genre)) {
            genres = genres.concat(genre)
          }
        })
      })
      return genres
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated')

      const author = await Author.findOne({ name: args.author })
      try {
        if (!author) {
          const newAuthor = new Author({ name: args.author, bookCount: 1 })
          await newAuthor.save()
          let book = new Book({ ...args, author: newAuthor })
          await book.save()
          pubsub.publish('BOOK_ADDED', { bookAdded: book })
          return book
        }
        const updatedAuthor = await Author.findByIdAndUpdate(
          author.id,
          { $inc: { bookCount: 1 } },
          { new: true }
        )
        let book = new Book({ ...args, author: updatedAuthor })
        await book.save()
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated')

      const author = await Author.findOne({ name: args.name })
      if (!author) return null
      author.born = args.setBornTo
      const updatedAuthor = await Author.findByIdAndUpdate(author.id, author, {
        new: true,
      })
      return updatedAuthor
    },
    createUser: (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
      })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, config.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
