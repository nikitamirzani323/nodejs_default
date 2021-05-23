const express = require('express')
const router = express.Router()

router.post('/register', async (req, res, next) => {
    res.send('register router');
})
router.post('/login', async (req, res, next) => {
    res.send('login router');
})
router.post('/refresh-token', async (req, res, next) => {
    res.send('refresh token router');
})
router.delete('/logout', async (req, res, next) => {
    res.send('logout router');
})


module.exports = router