const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log("Mongodb connected")
    })
    .catch(err => console.log(err.message))

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to db')
})
mongoose.connection.on('error', (err) => {
    console.log(err.message)
})
mongoose.connection.on('diconnected', () => {
    console.log('Mongoose connection is disconnected')
})

process.on('SIGNINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})