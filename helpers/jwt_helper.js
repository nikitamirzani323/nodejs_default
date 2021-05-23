const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRET
            const option = {
                expiresIn: '30s',
                issuer: 'pickurpage.com',
                audience: userId
            }
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }

                resolve(token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]

        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },
    signRefreshToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRET
            const option = {
                expiresIn: '1d', //expire 1 hari
                issuer: 'pickurpage.com',
                audience: userId
            }
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                //set expire 1 tahun : 365 * 24 * 60 * 60
                //set expire 1 hari : 1 * 24 * 60 * 60
                client.SET(userId, token, 'EX', 1 * 24 * 60 * 60, (err, reply) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    resolve(token)
                })
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                const userId = payload.aud
                client.GET(userId, (err, result) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    if (refreshToken === result) return resolve(userId)
                    reject(createError.Unauthorized())
                })
                resolve(userId)
            })
        })
    }
}