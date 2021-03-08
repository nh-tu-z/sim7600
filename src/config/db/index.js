const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/user_management', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    console.log(`mongoDB: Connect successfully!!!`)
    } catch (error) {
        console.log(`mongoDB: Connect failure!!!`)
    }
}

module.exports = {connect}