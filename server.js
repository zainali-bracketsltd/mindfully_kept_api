require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http')
const httpServer = http.createServer(app)

const { Server } = require('socket.io')

const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
})

io.on('connection', socket => {
  console.log('*** socket connected ***', socket.id)
  socket.join('mindfully_kept')
})

const { connectDB } = require('./connectDB')

connectDB()

const cors = require('cors')
const morgan = require('morgan')
const PORT = 9000

app.use(cors())

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use('/twilio', require('./twilio.routes')(io))

httpServer.listen(PORT, () =>
  console.log(`http server listening on port ${PORT}`)
)
