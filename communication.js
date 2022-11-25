const mongoose = require('mongoose')

const communicationSchema = new mongoose.Schema(
  {
    _sender: String,
    _receiver: String,
    _messageSid: String,
    status: String
  },
  { timestamps: true, collection: 'communications' }
)

module.exports = mongoose.model('Communication', communicationSchema)
