const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const limitter = require('express-rate-limit')
const createError = require('http-errors')
const responseTime = require('response-time')
const compression = require('compression')
const axios = require('axios')
const client = require('./helpers/init_redis')
const {
    promisify
} = require('util')

require('dotenv').config()
require('./helpers/init_mongodb')
require('./helpers/init_redis')
const {
    verifyAccessToken
} = require('./helpers/jwt_helper')


const AuthRoute = require('./Routes/Auth.route')
const app = express()

app.use(helmet({
    referrerPolicy: {
        policy: "no-referrer"
    },
}))
app.use(compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false
        }
        return compression.filter(req, res)
    }
}))
app.use(morgan('dev'))
app.use(responseTime())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send("hello from express");
});
const authLimiter = limitter({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        code: 429,
        message: 'Too many request, Please try again'
    }
})
app.use('/auth', authLimiter, AuthRoute)

const aboutLimiter = limitter({
    windowMs: 5 * 60 * 1000,
    max: 2,
    message: {
        code: 429,
        message: 'Too many request, Please try again'
    }
})
app.get('/about', aboutLimiter, async (req, res, next) => {
    res.send("about");
})


const GET_ASYNC = promisify(client.GET).bind(client)
const SET_ASYNC = promisify(client.SET).bind(client)

app.get('/rockets', async (req, res, next) => {
    try {
        const reply = await GET_ASYNC('rockets')
        if (reply) {
            console.log('using cached data')
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get('https://api.spacexdata.com/v3/rockets')
        const saveResult = await SET_ASYNC('rockets', JSON.stringify(response.data), 'EX', 5)
        console.log('new data cached', saveResult)


        res.send(response.data)
    } catch (error) {
        next(error)
    }
})
app.get('/rockets/:rocket_id', async (req, res, next) => {
    try {
        const {
            rocket_id
        } = req.params
        const reply = await GET_ASYNC(rocket_id)
        if (reply) {
            console.log('using cached data')
            res.send(JSON.parse(reply))
            return
        }

        const response = await axios.get(`https://api.spacexdata.com/v3/rockets/${rocket_id}`)
        const saveResult = await SET_ASYNC(rocket_id, JSON.stringify(response.data), 'EX', 5)
        console.log('new data cached', saveResult)


        res.send(response.data)
    } catch (error) {
        next(error)
    }
})
app.get('/kompres', (req, res, next) => {
    const payload = 'Faster app which use less bandwith too....'
    res.send(payload.repeat(10000))
})


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