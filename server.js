const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')

const AuthRoute = require('./Routes/Auth.route')
const app = express()

app.use(morgan('dev'))
app.get('/', async (req, res, next) => {
    res.send("hello");
});

app.use('/auth', AuthRoute)
//CAPTURE ERROR NOT FOUND / router tidak terdaftar
app.use(async (res, req, next) => {
    next(createError.NotFound('This route does not exist'))
});
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
});
const PORT = process.env.PORT || 9999
app.listen(PORT, () => {
    console.log(`Server started on port`);
});