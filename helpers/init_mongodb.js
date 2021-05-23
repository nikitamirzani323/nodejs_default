const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017', {
        dbName: 'auth_tutorial',
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Mongodb connected")
    })
    .catch(err => console.log(err.message))