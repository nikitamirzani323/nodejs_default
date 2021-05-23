const mongoose = require("mongoose");
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    }
})

UserSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
        console.log(this.email, this.password)
        console.log("Called before saving a user")
    } catch (error) {
        next(error)
    }
})
// UserSchema.post('save', async function (next) {
//     try {
//         console.log("Called after saving a user")
//     } catch (error) {
//         next(error)
//     }
// })

const User = mongoose.model('user', UserSchema)
module.exports = User