const mongoose = require('mongoose')

const Schema = mongoose.Schema

const myUser = new Schema({
    username: {type: String, },
    password: {type: String, },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    endedAt: {type: Date, }
  })

module.exports = mongoose.model('Users', myUser)
