const JWT = require('jsonwebtoken')
const createError = require('http-errors')

module.exports = {
    signAccessToken: (userId) => {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = "some super secret"
            const option = {
                expiresIn: '1h',
                issuer: 'pickurpage.com',
                audience: userId
            }
            JWT.sign(payload, secret, option, (err, token) => {
                if (err) reject(err)
                resolve(token)
            })
        })
    }
}