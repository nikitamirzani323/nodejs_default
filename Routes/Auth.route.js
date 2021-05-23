const express = require('express')
const router = express.Router()
const createError = require('http-errors')
const User = require('../Models/User.model')
const {
    authSchema
} = require('../helpers/validation_schema')
const {
    signAccessToken
} = require('../helpers/jwt_helper')

router.post('/register', async (req, res, next) => {
    try {
        // const {
        //     email,
        //     password
        // } = req.body
        // if (!email || !password) throw createError.BadRequest()
        const result = await authSchema.validateAsync(req.body)


        const doesExist = await User.findOne({
            email: result.email
        })
        if (doesExist) throw createError.Conflict(`${result.email} is already been registered`)

        const user = new User(result)
        const savedUser = await user.save()
        const accessToken = await signAccessToken(savedUser.id)
        res.send({
            accessToken
        });
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
})
router.post('/login', async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const user = await User.findOne({
            email: result.email
        })

        if (!user) throw createError.NotFound("User not register")

        //CHECK PASSWORD
        const isMath = await user.isValidPassword(result.password)
        if (!isMath) throw createError.Unauthorized('Username/password not valid')

        const accessToken = await signAccessToken(user.id)

        res.send({
            accessToken
        })
    } catch (error) {
        //fungsinya ganti pesan error
        if (error.isJoi === true) return next(createError.BadRequest('Invalid Username/Password'))
        next(error)
    }
    res.send('login router');
})
router.post('/refresh-token', async (req, res, next) => {
    res.send('refresh token router');
})
router.delete('/logout', async (req, res, next) => {
    res.send('logout router');
})


module.exports = router