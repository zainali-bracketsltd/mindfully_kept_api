const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://mindfully-kept-api:<password>@mindfully-kept.hfyh5wj.mongodb.net/?retryWrites=true&w=majority',
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    )
  } catch (error) {
    console.log(error)

    process.exit(1)
  }

  mongoose.connection.on('connected', () => console.log('MongoDB connected...'))
}

module.exports = { connectDB }
