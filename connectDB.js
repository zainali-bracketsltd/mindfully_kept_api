const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const dbName = 'Mindfully_Kept'

    const connectionURI = `mongodb+srv://${process.env.MONGODB_USERNAME.trim()}:${process.env.MONGODB_PASSWORD.trim()}@mindfully-kept.hfyh5wj.mongodb.net/${dbName}?retryWrites=true&w=majority`

    mongoose.connect(connectionURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (error) {
    console.log(error)

    process.exit(1)
  }

  mongoose.connection.on('connected', () => console.log('MongoDB connected...'))
}

module.exports = { connectDB }
